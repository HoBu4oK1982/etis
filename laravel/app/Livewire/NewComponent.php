<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Product;

class NewComponent extends Component
{
    public function render()
    {
        $remark__new = Product::query()
            ->with('images')
            ->where('remark', 'new')
            ->get();

        return view('livewire.new-component', [
            'remark__new' => $remark__new,
        ])->layout('layouts.base');
    }
}
