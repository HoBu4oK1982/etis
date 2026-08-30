<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Category;

class ShopComponent extends Component
{
    public function render()
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->where('status', 0)
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $breadcrumbs = [
            ['title' => 'Магазин', 'url' => null],
        ];

        return view('livewire.shop-component', [
            'categories' => $categories,
            'breadcrumbs' => $breadcrumbs,
        ])->layout('layouts.base');
    }
}
