<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreOrderRequest;
use App\Mail\GuestAccountMail;
use App\Mail\OrderMail;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * POST /api/v1/orders
     *
     * Next.js передаёт только контакты, способ получения, ID товаров и
     * количество. Laravel не доверяет цене из браузера: товары и актуальные
     * цены повторно читаются из БД внутри транзакции.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $authUser = $request->user('sanctum');
        $email = strtolower($data['customer_email']);

        if ($existing = Order::query()
            ->where('checkout_token', $data['checkout_token'])
            ->first()) {
            $this->ensureReplayBelongsToCustomer($existing, $authUser?->id, $email);

            return $this->orderResponse($existing, false, true, 200);
        }

        if ($authUser && strtolower((string) $authUser->email) !== $email) {
            throw ValidationException::withMessages([
                'customer_email' => ['Для заказа используйте e-mail из личного кабинета.'],
            ]);
        }

        $temporaryPassword = null;
        $accountCreated = false;

        try {
            $order = DB::transaction(function () use (
                $data,
                $email,
                $authUser,
                &$temporaryPassword,
                &$accountCreated
            ) {
                $user = $authUser;

                if (!$user) {
                    $registeredUser = User::query()
                        ->whereRaw('LOWER(email) = ?', [$email])
                        ->first();

                    if ($registeredUser) {
                        throw ValidationException::withMessages([
                            'customer_email' => [
                                'Этот e-mail уже зарегистрирован. Войдите в личный кабинет и повторите оформление.',
                            ],
                        ]);
                    }

                    $temporaryPassword = Str::password(12, true, true, false, false);
                    $user = User::create([
                        'name' => $data['customer_name'],
                        'email' => $email,
                        'phone' => $data['customer_phone'],
                        'city' => $data['city'],
                        'password' => Hash::make($temporaryPassword),
                    ]);
                    $accountCreated = true;
                } else {
                    // E-mail авторизованного пользователя менять из checkout нельзя.
                    $user->forceFill([
                        'name' => $data['customer_name'],
                        'phone' => $data['customer_phone'],
                        'city' => $data['city'],
                    ])->save();
                }

                $user->profile()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'phone' => $data['customer_phone'],
                        'city' => $data['city'],
                        'address' => $data['delivery_type'] === 'delivery'
                            ? ($data['address'] ?: null)
                            : null,
                    ]
                );

                $requested = collect($data['items'])
                    ->keyBy(fn (array $item) => (int) $item['product_id']);

                $products = Product::query()
                    ->whereIn('id', $requested->keys())
                    ->where('status', 0)
                    ->get()
                    ->keyBy('id');

                $missingIds = $requested->keys()->diff($products->keys());
                if ($missingIds->isNotEmpty()) {
                    throw ValidationException::withMessages([
                        'items' => ['Некоторые товары больше недоступны. Обновите корзину и повторите попытку.'],
                    ]);
                }

                $subtotal = 0;
                $preparedItems = [];

                foreach ($requested as $productId => $item) {
                    $product = $products->get((int) $productId);
                    $qty = (int) $item['qty'];
                    $sellingPrice = (float) ($product->selling_price ?? 0);
                    $regularPrice = (float) ($product->price ?? 0);
                    $price = (int) round($sellingPrice > 0 ? $sellingPrice : $regularPrice);

                    if ($price < 0) {
                        throw ValidationException::withMessages([
                            'items' => ['Для одного из товаров указана некорректная цена.'],
                        ]);
                    }

                    $subtotal += $price * $qty;
                    $preparedItems[] = [
                        'product_id' => $product->id,
                        'price' => $price,
                        'qty' => $qty,
                    ];
                }

                $order = Order::create([
                    'checkout_token' => $data['checkout_token'],
                    'user_id' => $user->id,
                    'subtotal' => $subtotal,
                    'total' => $subtotal,
                    'user_name' => $data['customer_name'],
                    'mobile' => $data['customer_phone'],
                    'email' => $email,
                    'address' => $data['delivery_type'] === 'pickup'
                        ? 'Самовывоз: ' . $data['city']
                        : $data['address'],
                    'city' => $data['city'],
                    'delivery_type' => $data['delivery_type'],
                    'comment' => $data['comment'] ?: null,
                    'status' => 'ordered',
                ]);

                $order->orderItems()->createMany($preparedItems);

                return $order->load('orderItems.product.images');
            }, 3);
        } catch (QueryException $exception) {
            // Два одинаковых запроса могли прийти одновременно. Уникальный
            // checkout_token оставляет в базе только один заказ.
            $existing = Order::query()
                ->where('checkout_token', $data['checkout_token'])
                ->first();

            if ($existing) {
                $this->ensureReplayBelongsToCustomer($existing, $authUser?->id, $email);

                return $this->orderResponse($existing, false, true, 200);
            }

            throw $exception;
        }

        // Письма отправляем ПОСЛЕ того, как клиент получит ответ,
        // чтобы медленный SMTP не блокировал checkout.
        $tempPwd = $accountCreated ? $temporaryPassword : null;
        app()->terminating(function () use ($order, $tempPwd) {
            $this->sendMails($order, $tempPwd);
        });

        return $this->orderResponse($order, $accountCreated, false, 201);
    }

    private function ensureReplayBelongsToCustomer(
        Order $order,
        ?int $authenticatedUserId,
        string $email
    ): void {
        $belongsToCustomer = $authenticatedUserId
            ? (int) $order->user_id === $authenticatedUserId
            : strtolower((string) $order->email) === $email;

        if (!$belongsToCustomer) {
            throw ValidationException::withMessages([
                'checkout_token' => ['Идентификатор заказа уже использован. Обновите страницу и повторите попытку.'],
            ]);
        }
    }

    private function orderResponse(
        Order $order,
        bool $accountCreated,
        bool $replayed,
        int $status
    ): JsonResponse {
        return response()->json([
            'message' => $replayed
                ? 'Заказ уже был создан ранее.'
                : 'Заказ успешно принят.',
            'data' => [
                'id' => $order->id,
                'order_number' => $this->orderNumber($order),
                'status' => $order->status,
                'subtotal' => (int) $order->subtotal,
                'total' => (int) $order->total,
                'account_created' => $accountCreated,
                'replayed' => $replayed,
            ],
        ], $status);
    }

    private function sendMails(Order $order, ?string $temporaryPassword): void
    {
        try {
            Mail::to($order->email)->send(new OrderMail($order));
        } catch (\Throwable $exception) {
            Log::warning('ETIS_ORDER_CUSTOMER_MAIL_FAILED', [
                'order_id' => $order->id,
                'error' => $exception->getMessage(),
            ]);
        }

        if ($temporaryPassword) {
            try {
                Mail::to($order->email)->send(new GuestAccountMail(
                    $order->user_name,
                    $order->email,
                    $temporaryPassword
                ));
            } catch (\Throwable $exception) {
                Log::warning('ETIS_GUEST_ACCOUNT_MAIL_FAILED', [
                    'order_id' => $order->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        $adminEmail = (string) config('etis.orders.admin_email', 'info@etis.kz');

        if ($adminEmail !== '') {
            try {
                Mail::to($adminEmail)->send(new OrderMail($order));
            } catch (\Throwable $exception) {
                Log::warning('ETIS_ORDER_ADMIN_MAIL_FAILED', [
                    'order_id' => $order->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }
    }

    private function orderNumber(Order $order): string
    {
        $date = $order->created_at ?: now();

        return 'ET-'
            . $date->format('ym')
            . '-'
            . str_pad((string) $order->id, 6, '0', STR_PAD_LEFT);
    }
}
