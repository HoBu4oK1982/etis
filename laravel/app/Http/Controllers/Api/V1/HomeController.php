<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ArticleResource;
use App\Http\Resources\V1\BrandResource;
use App\Http\Resources\V1\CategoryResource;
use App\Http\Resources\V1\ProductListResource;
use App\Http\Resources\V1\SliderResource;
use App\Models\Article;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Slider;

class HomeController extends Controller
{
    /**
     * GET /api/v1/home
     * Всё для главной страницы одним запросом (меньше водопадов).
     */
    public function index()
    {
        // Слайдер
        $slides = Slider::where('status', 0)
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        // Категории верхнего уровня
        $rootCategories = Category::whereNull('parent_id')
            ->where('status', 0)
            ->orderBy('position')
            ->get();

        // Товары по ремаркам
        $hits = Product::with(['images', 'brand'])
            ->where('status', 0)
            ->where('remark', 'hit')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        $sales = Product::with(['images', 'brand'])
            ->where('status', 0)
            ->where('remark', 'sale')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        $news = Product::with(['images', 'brand'])
            ->where('status', 0)
            ->where('remark', 'new')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        // 3 последних статьи
        $articles = Article::where('status', 0)
            ->orderByDesc('id')
            ->limit(3)
            ->get();

        // Партнёры для карусели: активные бренды С загруженным логотипом.
        // Без картинки в карусели показывать нечего — такие бренды остаются
        // на странице /brands, там их прикрывает монограмма-фолбэк.
        $partners = Brand::where('status', 0)
            ->whereNotNull('image')
            ->where('image', '!=', '')
            ->orderBy('position')
            ->orderBy('title')
            ->get();

        return response()->json([
            'data' => [
                'slides'          => SliderResource::collection($slides),
                'root_categories' => CategoryResource::collection($rootCategories),
                'hits'            => ProductListResource::collection($hits),
                'sales'           => ProductListResource::collection($sales),
                'news'            => ProductListResource::collection($news),
                'articles'        => ArticleResource::collection($articles),
                'partners'        => BrandResource::collection($partners),
            ],
        ]);
    }
}
