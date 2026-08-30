<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HomeController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\ArticleController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\AccountController;

/*
|--------------------------------------------------------------------------
| API Routes v1 (Next.js frontend)
|--------------------------------------------------------------------------
*/

// Удалены устаревшие маршруты FrontendController: самого контроллера в проекте нет,
// а актуальный Next.js использует API v1 ниже.

Route::prefix('v1')->group(function () {

    // ---- Публичные ----

    // Главная (агрегат)
    Route::get('home', [HomeController::class, 'index']);

    // Категории
    // ВАЖНО: статические сегменты (tree/top) объявляем ДО {slug},
    // иначе Laravel съест их как slug.
    Route::get('categories/tree', [CategoryController::class, 'tree']);
    Route::get('categories/top', [CategoryController::class, 'top']);
    Route::get('categories/{slug}', [CategoryController::class, 'show']);
    Route::get('categories/{slug}/products', [CategoryController::class, 'products']);

    // Бренды
    Route::get('brands', [BrandController::class, 'index']);
    Route::get('brands/{slug}', [BrandController::class, 'show']);
    Route::get('brands/{slug}/products', [BrandController::class, 'products']);

    // Товары
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);

    // Корзина (валидация)
    Route::post('cart/validate', [ProductController::class, 'validateCart']);

    // === Умный поиск ===
    // Полный поиск (страница /search)
    Route::get('search', [SearchController::class, 'search']);
    // Быстрые подсказки для шапки
    Route::get('search/suggest', [SearchController::class, 'suggest']);
    // Популярные запросы (когда поле поиска пустое)
    Route::get('search/popular', [SearchController::class, 'popular']);
    // Аналитика: топ запросов без результата
    Route::get('search/no-results', [SearchController::class, 'noResultsList']);
    // Фронт логирует пустой suggest
    Route::post('search/no-results', [SearchController::class, 'noResults']);
    // Фронт логирует клик по результату (для популярности)
    Route::post('search/click', [SearchController::class, 'click']);

    // Статьи
    Route::get('articles', [ArticleController::class, 'index']);
    Route::get('articles/{slug}', [ArticleController::class, 'show']);

    // Оформление заказа: Bearer-токен необязателен, цена пересчитывается на сервере.
    Route::post('orders', [OrderController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('api.v1.orders.store');

    // ---- Auth (Sanctum, personal access tokens) ----
    // Публичные: регистрация и вход. Throttle защитит от подбора паролей.
    Route::middleware('throttle:20,1')->group(function () {
        Route::post('auth/register', [AuthController::class, 'register']);
        Route::post('auth/login',    [AuthController::class, 'login']);
    });

    // Защищённые: требуют Bearer-токен
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me',      [AuthController::class, 'me']);

        Route::get('account/profile', [AccountController::class, 'profile']);
        Route::put('account/profile', [AccountController::class, 'updateProfile']);
        Route::put('account/password', [AccountController::class, 'updatePassword']);
        Route::get('account/orders', [AccountController::class, 'orders']);
        Route::get('account/orders/{order}', [AccountController::class, 'order']);
    });

});
