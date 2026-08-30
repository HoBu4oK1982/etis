<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Article;

class AdminArticlesComponent extends Component
{
    use WithPagination;
    public $searchTerm;

    public function render()
    {
        $search = "%" . $this->searchTerm . "%";
        $articles = Article::where('title', 'LIKE', $search)->orderBy('id', 'ASC')->paginate(8);

        return view('livewire.admin.admin-articles-component', [
            'articles' => $articles,
        ])->layout('layouts.admin');
    }
}
