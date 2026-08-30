<?php

namespace App\Observers;

use App\Models\Article;
use App\Services\NextRevalidator;

class ArticleRevalidateObserver
{
    public function saved(Article $article): void
    {
        NextRevalidator::forArticle($article);
    }

    public function deleted(Article $article): void
    {
        NextRevalidator::forArticle($article);
    }

    public function restored(Article $article): void
    {
        NextRevalidator::forArticle($article);
    }
}
