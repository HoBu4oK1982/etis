<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use App\Models\Order;

class AdminOrderComponent extends Component
{
    public $order_id;

    public function mount($order_id){
        $this->order_id = $order_id;
    }

    public function render()
    {
        $order = Order::find($this->order_id);

        return view('livewire.admin.admin-order-component', [
            'order' => $order,
        ])->layout('layouts.admin');
    }
}
