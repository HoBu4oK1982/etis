<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user()->load('profile');

        return response()->json(['data' => $this->profilePayload($user)]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email:filter', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'city' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update([
            'name' => trim($data['name']),
            'email' => strtolower(trim($data['email'])),
            'phone' => preg_replace('/\D+/', '', (string) ($data['phone'] ?? '')) ?: null,
            'city' => trim((string) ($data['city'] ?? '')) ?: null,
        ]);

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'phone' => preg_replace('/\D+/', '', (string) ($data['phone'] ?? '')) ?: null,
                'city' => trim((string) ($data['city'] ?? '')) ?: null,
                'address' => trim((string) ($data['address'] ?? '')) ?: null,
            ]
        );

        return response()->json(['data' => $this->profilePayload($user->fresh('profile'))]);
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'password.confirmed' => 'Пароли не совпадают.',
            'password.min' => 'Новый пароль должен быть не короче 8 символов.',
        ]);

        $user = $request->user();
        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Текущий пароль указан неверно.'],
            ]);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['ok' => true]);
    }

    public function orders(Request $request)
    {
        $perPage = min(20, max(5, (int) $request->integer('per_page', 10)));
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->withCount('orderItems')
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'data' => [
                'items' => collect($orders->items())->map(fn (Order $order) => $this->orderPayload($order)),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ],
            ],
        ]);
    }

    public function order(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 404);
        $order->load('orderItems.product.images');

        return response()->json(['data' => $this->orderPayload($order, true)]);
    }

    private function profilePayload($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->profile?->phone ?: $user->phone,
            'city' => $user->profile?->city ?: $user->city,
            'address' => $user->profile?->address,
            'created_at' => optional($user->created_at)->toISOString(),
        ];
    }

    private function orderPayload(Order $order, bool $withItems = false): array
    {
        $payload = [
            'id' => $order->id,
            'order_number' => 'ET-' . $order->created_at->format('ym') . '-' . str_pad((string) $order->id, 6, '0', STR_PAD_LEFT),
            'status' => $order->status,
            'customer_name' => $order->user_name,
            'customer_email' => $order->email,
            'customer_phone' => $order->mobile,
            'city' => $order->city,
            'address' => $order->address,
            'delivery_type' => $order->delivery_type ?: (str_starts_with((string) $order->address, 'Самовывоз') ? 'pickup' : 'delivery'),
            'comment' => $order->comment,
            'items_count' => (int) ($order->order_items_count ?? $order->orderItems->sum('qty')),
            'subtotal' => (int) $order->subtotal,
            'total' => (int) $order->total,
            'created_at' => $order->created_at?->toISOString(),
        ];

        if ($withItems) {
            $payload['items'] = $order->orderItems->map(function ($item) {
                $product = $item->product;
                $image = $product?->images?->first();
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'title' => $product?->title ?: 'Товар',
                    'slug' => $product?->slug,
                    'thumbnail' => $image ? asset('assets/images/products/' . $image->file_name) : null,
                    'qty' => (int) $item->qty,
                    'price' => (int) $item->price,
                    'line_total' => (int) $item->price * (int) $item->qty,
                ];
            })->values();
        }

        return $payload;
    }
}
