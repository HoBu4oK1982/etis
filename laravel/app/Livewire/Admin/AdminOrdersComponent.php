<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use App\Models\Order;
use Livewire\WithPagination;



class AdminOrdersComponent extends Component
{
    use WithPagination;

    public function updateOrderStatus ($order_id, $status){

        $order = Order::find($order_id);

        if (!$order) {
            session()->flash('order_message', 'Заказ не найден.');
            return;
        }

        $order->status = $status;

        // ВАЖНО: delivered_date/canceled_date в модели Order объявлены
        // с кастом 'date'. DB::raw('CURRENT_DATE') ломает Eloquent-каст
        // (Carbon::createFromFormat ожидает строку, а не объект Expression)
        // и приводит к 500. Передаём обычную дату, каст сам её обработает.
        if($status == "delivered"){
            $order->delivered_date = now();
        } else if($status  == "canceled"){
            $order->canceled_date = now();
        }
        $order->save();
        session()->flash('order_message', 'Статус успешно изменен!');

    }


    public function render() {

        $orders = Order::orderBy('created_at', 'DESC')->paginate(10);
        return view('livewire.admin.admin-orders-component', [
            'orders' => $orders,
        ])->layout('layouts.admin');

    }
}
