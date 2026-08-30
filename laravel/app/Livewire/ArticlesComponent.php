<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Article;

class ArticlesComponent extends Component
{
    public function render()
    {
        $articles = Article::where('status', 0)->get();

        return view('livewire.articles-component', [
            'articles' => $articles,
        ])->layout('layouts.base');
    }
}
