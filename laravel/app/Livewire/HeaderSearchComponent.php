<?php

namespace App\Livewire;

use App\Models\Category;
use App\Models\Product;
use Livewire\Component;

class HeaderSearchComponent extends Component{

    public $search;

    public $query;
    public $products;    

    public function mount(){
       $this->preset();
       $this->fill(request()->only('search'));
    }

    public function preset(){
        $this->query = '';
        $this->products = [];
    }

    public function updatedQuery(){
        $q = trim((string) $this->query);
        if ($q === '') {
            $this->products = [];
            return;
        }

        $this->products = Product::query()
            ->where('status', 0)
            ->where(function ($qq) use ($q) {
                $qq->where('title', 'LIKE', '%' . $q . '%')
                   ->orWhere('sku', 'LIKE', '%' . $q . '%');
            })
            ->take(10)
            ->get()
            ->toArray();
    }

    public function render()
    {
        return view('livewire.header-search-component');
    }

}
