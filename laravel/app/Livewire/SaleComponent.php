<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Product;

class SaleComponent extends Component
{
    public function render()
    {
        $remark__sale = Product::query()
            ->with('images')
            ->where('remark', 'sale')
            ->get();

        return view('livewire.sale-component', [
            'remark__sale' => $remark__sale,
        ])->layout('layouts.base');
    }
}
