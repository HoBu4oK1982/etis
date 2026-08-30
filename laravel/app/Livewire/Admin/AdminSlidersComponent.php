<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Slider;

class AdminSlidersComponent extends Component
{
    use WithPagination;

    public function render()
    {
        $slides = Slider::paginate(10);

        return view('livewire.admin.admin-sliders-component', [
            'slides' => $slides,
        ])->layout('layouts.admin');
    }
}
