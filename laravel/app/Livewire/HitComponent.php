<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Product;

class HitComponent extends Component
{
    public function render()
    {
        $remark__hit = Product::query()
            ->with('images')
            ->where('remark', 'hit')
            ->get();

        return view('livewire.hit-component', [
            'remark__hit' => $remark__hit,
        ])->layout('layouts.base');
    }
}
