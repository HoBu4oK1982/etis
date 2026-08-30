<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Observers\SearchableObserver;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Article;

/**
 * Регистрирует observers, поддерживающие поисковый индекс в актуальном
 * состоянии при сохранении/удалении Product / Category / Brand / Article.
 *
 * Подключение: добавьте App\Providers\SearchServiceProvider::class
 * в bootstrap/providers.php (Laravel 11/12) или config/app.php 'providers' (10-).
 */
class SearchServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        foreach ([Product::class, Category::class, Brand::class, Article::class] as $model) {
            $model::observe(SearchableObserver::class);
        }
    }
}
