<?php

namespace App\Providers;

use App\Models\Article;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Slider;
use App\Observers\ArticleRevalidateObserver;
use App\Observers\BrandRevalidateObserver;
use App\Observers\CategoryRevalidateObserver;
use App\Observers\ProductRevalidateObserver;
use App\Observers\SliderRevalidateObserver;
use Illuminate\Support\ServiceProvider;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * Здесь регистрируем observers ревалидации ISR-кэша фронта:
     * при любых изменениях в админке (сохранение/удаление/восстановление)
     * фронт получает POST /api/revalidate со списком связанных тегов
     * и обновляет кэш соответствующих страниц без ручной очистки.
     *
     * Поисковую индексацию (SearchableObserver) регистрирует свой
     * SearchServiceProvider — не пересекается с этой цепочкой.
     */
    public function boot(): void
    {
        Product::observe(ProductRevalidateObserver::class);
        Category::observe(CategoryRevalidateObserver::class);
        Brand::observe(BrandRevalidateObserver::class);
        Article::observe(ArticleRevalidateObserver::class);
        Slider::observe(SliderRevalidateObserver::class);
    }
}
