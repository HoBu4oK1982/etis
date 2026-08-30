<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Product;

class ProductDetailsComponent extends Component
{
    public $slug;

    public function mount($slug)
    {
        $this->slug = $slug;
    }

    public function render()
    {
        $product = Product::query()
            ->with(['images', 'category.parent.parent', 'attributes'])
            ->where('slug', $this->slug)
            ->firstOrFail();

        $related_products = Product::query()
            ->with('images')
            ->where('id', '!=', $product->id)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        return view('livewire.product-details-component', [
            'product' => $product,
            'related_products' => $related_products,
        ])->layout('layouts.base');
    }
}