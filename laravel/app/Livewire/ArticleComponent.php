<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Article;

class ArticleComponent extends Component
{
    public $slug;

    public function mount($article_slug){
        $this->slug = $article_slug;
    }

    public function render()
    {
        $article = Article::where('slug', $this->slug)->first();

        return view('livewire.article-component', [
            'article' => $article,
        ])->layout('layouts.base');
    }
}
