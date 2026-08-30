<?php

namespace App\Livewire;

use App\Models\Product;
use Livewire\Component;
use Livewire\WithPagination;
use Cart;
use App\Models\Category;

class SearchComponent extends Component
{
    use WithPagination;

    public $sorting;
    public $pagesize;
    public $search;

    public function mount()
    {
        $this->sorting = "default";
        $this->pagesize = 30;
        $this->fill(request()->only('search'));
    }

    public function render()
    {
        $baseQuery = Product::query()
            ->with('images')
            ->where('status', 0)
            ->where(function ($q) {
                $q->where('title', 'like', '%' . $this->search . '%')
                  ->orWhere('sku', 'like', '%' . $this->search . '%');
            });

        if ($this->sorting == 'date') {
            $baseQuery->orderBy('created_at', 'DESC');
        } elseif ($this->sorting == 'price') {
            $baseQuery->orderBy('price', 'ASC');
        } elseif ($this->sorting == 'price-desc') {
            $baseQuery->orderBy('price', 'DESC');
        }

        $products = $baseQuery->paginate($this->pagesize);
        $categories = Category::where('status', 0)->get();

        return view('livewire.search-component', [
            'products' => $products,
            'categories' => $categories
        ])->layout('layouts.base');
    }
}
