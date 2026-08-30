<?php

namespace App\Livewire;

use App\Mail\OrderMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Livewire\Component;
use Cart;

class CheckoutComponent extends Component
{
    public $firstname;
    public $email;
    public $mobile;
    public $address;
    public $noaddress = false;
    public $city;
    public $paymentmode;
    public $thankyou;

    public function mount()
    {
        if (Auth::check()) {
            $user = Auth::user();
            $this->firstname = $user->name;
            $this->mobile = $user->phone;
            $this->email = $user->email;
            $this->address = $user->address ?? '';
            $this->city = $user->city ?? '';
        }
    }

    public function updated($fields)
    {
        $this->validateOnly($fields, [
            'firstname' => 'required|string|min:2',
            'mobile'    => ['required', 'string', 'min:5'], // телефон часто с +7 и скобками
            'email'     => 'required|email',
            'address'   => $this->noaddress ? 'nullable' : 'required|string|min:3',
            'city'      => 'required|string|min:2',
        ]);
    }

    protected $messages = [
        'firstname.required' => 'Имя обязательное поле',
        'mobile.required'    => 'Телефон обязательное поле',
        'email.required'     => 'Email обязательное поле',
        'email.email'        => 'Вы ввели не email',
        'address.required'   => 'Адрес обязательное поле',
        'city.required'      => 'Город обязательное поле',
    ];

    public function updatedNoaddress($value)
    {
        if ($value) {
            $this->address = null;
        }
    }

    protected function sendOrderConfirmationMail(Order $order): void
    {
        $admin = 'olegdata82@mail.ru';

        try {
            Mail::to($order->email)->send(new OrderMail($order));
        } catch (\Throwable $e) {
            Log::error('ORDER_MAIL_USER_FAILED', [
                'order_id' => $order->id,
                'email'    => $order->email,
                'error'    => $e->getMessage(),
            ]);
        }

        try {
            Mail::to($admin)->send(new OrderMail($order));
        } catch (\Throwable $e) {
            Log::error('ORDER_MAIL_ADMIN_FAILED', [
                'order_id' => $order->id,
                'email'    => $admin,
                'error'    => $e->getMessage(),
            ]);
        }
    }


    public function placeOrder()
    {
        $this->validate([
            'firstname' => 'required|string|min:2',
            'mobile'    => ['required', 'string', 'min:5'],
            'email'     => 'required|email',
            'city'      => 'required|string|min:2',
            'address'   => $this->noaddress ? 'nullable' : 'required|string|min:3',
        ]);

        $cartItems = Cart::instance('cart')->content();
        if ($cartItems->count() === 0) {
            session()->flash('error', 'Корзина пуста.');
            return;
        }


        // Создаём заказ
        $order = new Order();
        $order->user_id    = Auth::user()->id;
        $order->subtotal   = (int) str_replace(',', '', (string) session()->get('checkout.subtotal', 0));
        $order->total      = (int) str_replace(',', '', (string) session()->get('checkout.total', 0));
        $order->user_name  = $this->firstname;
        $order->email      = $this->email;
        $order->mobile     = $this->mobile;
        $order->address    = $this->noaddress ? 'Самовывоз' : $this->address;
        $order->city       = $this->city;
        $order->status     = 'ordered';
        $order->save();

        // Позиции заказа
        foreach ($cartItems as $item) {
            $orderItem = new OrderItem();
            $orderItem->product_id = $item->id;
            $orderItem->order_id   = $order->id;
            $orderItem->price      = (int) $item->price;
            $orderItem->qty        = (int) $item->qty;
            $orderItem->save();
        }

        $this->sendOrderConfirmationMail($order);

        // Чистим корзину всегда
        Cart::instance('cart')->destroy();
        session()->forget('checkout');
        $this->thankyou = 1;

        return $this->redirectRoute('thankyou');
    }

    public function verifyForCheckout()
    {
        if (!Auth::check()) {
            return $this->redirectRoute('login');
        }
        if ($this->thankyou) {
            return $this->redirectRoute('thankyou');
        }
        if (!session()->get('checkout')) {
            return $this->redirectRoute('cart');
        }
    }

    public function render()
    {
        $this->verifyForCheckout();
        return view('livewire.checkout-component')->layout('layouts.base');
    }
}
