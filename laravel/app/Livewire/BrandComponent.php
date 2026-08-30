<?php

namespace App\Livewire;

use App\Models\Brand;
use App\Models\Product;
use Livewire\Component;
use Livewire\WithPagination;

class BrandComponent extends Component
{
    use WithPagination;

    public string $slug;
    public string $sort = 'default';

    public function mount(string $slug)
    {
        $this->slug = $slug;

        // ✅ читаем sort из URL при первом заходе
        $this->sort = request()->query('sort', 'default');
        if (!in_array($this->sort, ['default', 'date', 'price', 'price-desc'], true)) {
            $this->sort = 'default';
        }
    }

    /**
     * ✅ Смена сортировки: сбрасываем пагинацию и обновляем URL всегда
     */
    public function updatedSort($value)
    {
        $this->resetPage();

        $url = route('brand', ['slug' => $this->slug]);

        if ($value && $value !== 'default') {
            $url .= '?sort=' . urlencode($value);
        }

        // ✅ важно: navigate:true чтобы обновлялся адрес без полного рефреша
        $this->redirect($url, navigate: true);
    }

    private function productsQuery(int $brandId)
    {
        // ✅ цена как целое число (даже если в БД строка/пусто)
        $priceIntSql = "CAST(NULLIF(COALESCE(selling_price, price), '') AS UNSIGNED)";

        $q = Product::query()
            ->with(['images', 'brand'])
            ->where('brand_id', $brandId)
            ->where('status', 0);

        switch ($this->sort) {
            case 'price':
                $q->orderByRaw("({$priceIntSql} = 0) ASC")
                  ->orderByRaw("{$priceIntSql} ASC")
                  ->orderByDesc('id');
                break;

            case 'price-desc':
                $q->orderByRaw("({$priceIntSql} = 0) ASC")
                  ->orderByRaw("{$priceIntSql} DESC")
                  ->orderByDesc('id');
                break;

            case 'date':
                $q->orderByDesc('created_at')
                  ->orderByDesc('id');
                break;

            default:
                $q->orderByDesc('id');
        }

        return $q;
    }

    public function render()
    {
        $brand = Brand::query()
            ->where('status', 0)
            ->where('slug', $this->slug)
            ->firstOrFail();

        $products = $this->productsQuery($brand->id)->paginate(24);

        $breadcrumbs = [
            ['title' => 'Бренды', 'url' => route('brands')],
            ['title' => $brand->title, 'url' => null],
        ];

        return view('livewire.brand-component', [
            'brand' => $brand,
            'products' => $products,
            'breadcrumbs' => $breadcrumbs,
        ])->layout('layouts.base');
    }
}
