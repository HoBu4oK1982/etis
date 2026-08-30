<?php

namespace App\Livewire;

use App\Models\Brand;
use Livewire\Component;

class BrandsComponent extends Component
{
    public function render()
    {
        $brands = Brand::query()
            ->where('status', 0)
            ->whereNotNull('title')
            ->orderBy('position')
            ->orderBy('title')
            ->get();

        $breadcrumbs = [
            ['title' => 'Бренды', 'url' => null],
        ];

        return view('livewire.brands-component', [
            'brands' => $brands,
            'breadcrumbs' => $breadcrumbs,
        ])->layout('layouts.base');
    }
}
