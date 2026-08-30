<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Заглушки для старых именованных маршрутов
|--------------------------------------------------------------------------
| Livewire-шаблоны (админка, корзина, избранное и т.д.) до сих пор
| ссылаются через route('product.details') и route('product.search') —
| в новом Laravel эти маршруты не определены, из-за чего Blade рендерит
| RouteNotFoundException и вся страница отдаёт 500.
|
| Регистрируем их как редиректы на Next.js фронт (etis.kz).
| Тогда любой старый вызов route() продолжает работать, а пользователь
| попадает на новую страницу товара / поиск.
*/

Route::get('/product/{slug}', function (string $slug) {
    $frontend = rtrim(env('FRONTEND_URL', 'https://etis.kz'), '/');
    return redirect()->away($frontend . '/product/' . $slug);
})->name('product.details');

Route::get('/search', function (\Illuminate\Http\Request $request) {
    $frontend = rtrim(env('FRONTEND_URL', 'https://etis.kz'), '/');
    $query = $request->query();
    $qs = $query ? '?' . http_build_query($query) : '';
    return redirect()->away($frontend . '/search' . $qs);
})->name('product.search');


// ---- ADMIN Livewire компоненты ----
use App\Livewire\Admin\AdminDashboardComponent;
use App\Livewire\Admin\AdminSlidersComponent;
use App\Livewire\Admin\AdminAddSlideComponent;
use App\Livewire\Admin\AdminEditSlideComponent;
use App\Livewire\Admin\AdminArticlesComponent;
use App\Livewire\Admin\AdminAddArticleComponent;
use App\Livewire\Admin\AdminEditArticleComponent;
use App\Livewire\Admin\AdminOrdersComponent;
use App\Livewire\Admin\AdminOrderComponent;
use App\Livewire\Admin\AdminCategoriesComponent;
use App\Livewire\Admin\AdminAddCategoryComponent;
use App\Livewire\Admin\AdminEditCategoryComponent;
use App\Livewire\Admin\AdminProductsComponent;
use App\Livewire\Admin\AdminAddProductComponent;
use App\Livewire\Admin\AdminEditProductComponent;
use App\Livewire\Admin\AdminBrandsComponent;
use App\Livewire\Admin\AdminAddBrandComponent;
use App\Livewire\Admin\AdminEditBrandComponent;


/*
|--------------------------------------------------------------------------
| Laravel — только админка. Фронт магазина на Next.js через /api/v1/*.
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (Auth::check() && Auth::user()->hasRole('admin')) {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('login');
})->name('home');


Route::middleware(['auth', 'role:admin'])->group(function () {

    Route::get('/admin', AdminDashboardComponent::class)->name('admin.dashboard');

    // Categories
    Route::get('/admin/categories', AdminCategoriesComponent::class)->name('admin.categories');
    Route::get('/admin/category/add', AdminAddCategoryComponent::class)->name('admin.addcategory');
    Route::get('/admin/category/edit/{category_id}', AdminEditCategoryComponent::class)->name('admin.editcategory');

    // Products
    Route::get('/admin/products', AdminProductsComponent::class)->name('admin.products');
    Route::get('/admin/product/add', AdminAddProductComponent::class)->name('admin.addproduct');
    Route::get('/admin/product/edit/{product_id}', AdminEditProductComponent::class)->name('admin.editproduct');
    // Дубликат — открывает форму создания с предзаполненными данными исходного товара
    Route::get('/admin/product/duplicate/{source_id}', AdminAddProductComponent::class)->name('admin.duplicateproduct');

    // Brands
    Route::get('/admin/brands', AdminBrandsComponent::class)->name('admin.brands');
    Route::get('/admin/brand/add', AdminAddBrandComponent::class)->name('admin.addbrand');
    Route::get('/admin/brand/edit/{brand_id}', AdminEditBrandComponent::class)->name('admin.editbrand');

    // Slides
    Route::get('/admin/slides', AdminSlidersComponent::class)->name('admin.slides');
    Route::get('/admin/slide/add', AdminAddSlideComponent::class)->name('admin.addslide');
    Route::get('/admin/slide/edit/{slide_id}', AdminEditSlideComponent::class)->name('admin.editslide');

    // Articles
    Route::get('/admin/articles', AdminArticlesComponent::class)->name('admin.articles');
    Route::get('/admin/article/add', AdminAddArticleComponent::class)->name('admin.addarticle');
    Route::get('/admin/article/edit/{article_id}', AdminEditArticleComponent::class)->name('admin.editarticle');

    // Orders
    Route::get('/admin/orders', AdminOrdersComponent::class)->name('admin.orders');
    Route::get('/admin/orders/{order_id}', AdminOrderComponent::class)->name('admin.orderdetails');

});


require __DIR__.'/auth.php';
