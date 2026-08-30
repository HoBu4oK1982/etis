<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class ThankyouComponent extends Component
{
    public ?Order $order = null;

    public function mount(): void
    {
        if (!Auth::check()) {
            return;
        }

        $userId = Auth::id();

        // Берём самый свежий заказ пользователя (для страницы "Спасибо")
        $this->order = Order::query()
            ->where('user_id', $userId)
            ->withCount('orderItems')
            ->orderByDesc('id')
            ->first();
    }

    public function render()
    {
        return view('livewire.thankyou-component', [
            'order' => $this->order,
        ])->layout('layouts.base');
    }
}
