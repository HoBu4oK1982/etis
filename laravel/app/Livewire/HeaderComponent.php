<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Category;



class HeaderComponent extends Component
{
    public function render()
    {
        // Каталог в шапке: грузим дерево (несколько уровней) сразу, чтобы меню не делало N+1.
        $categories = Category::query()
            ->whereNull('parent_id')
            ->where('status', 0)
            ->orderBy('title')
            ->with([
                'activeChildren' => function ($q) {
                    $q->orderBy('title')->with([
                        'activeChildren' => function ($q2) {
                            $q2->orderBy('title')->with([
                                'activeChildren' => function ($q3) {
                                    $q3->orderBy('title');
                                },
                            ]);
                        },
                    ]);
                },
            ])
            ->get();

        return view('livewire.header-component', [
            'categories' => $categories,
        ])->layout('layouts.base');
    }
}
