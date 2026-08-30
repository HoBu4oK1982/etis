<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BrandResource;
use App\Http\Resources\V1\ProductListResource;
use App\Models\Brand;
use App\Models\Product;
use App\Support\CategoryTree;
use App\Support\ProductFilters;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    /**
     * GET /api/v1/brands
     *
     * Список брендов со счётчиками активных товаров.
     * Счётчики считаются одним группировочным запросом, а не N+1
     * через withCount на каждой записи.
     */
    public function index()
    {
        $counts = Product::where('status', 0)
            ->whereNotNull('brand_id')
            ->selectRaw('brand_id, COUNT(*) as aggregate_count')
            ->groupBy('brand_id')
            ->pluck('aggregate_count', 'brand_id')
            ->all();

        $brands = Brand::where('status', 0)
            ->orderBy('position')
            ->orderBy('title')
            ->get();

        $data = $brands
            ->map(fn ($brand) => array_merge(
                (new BrandResource($brand))->resolve(),
                ['products_count' => (int) ($counts[$brand->id] ?? 0)]
            ))
            ->all();

        return response()->json([
            'data' => $data,
            'meta' => [
                'total'          => count($data),
                'products_total' => array_sum($counts),
                'with_products'  => count(array_filter($data, fn ($b) => $b['products_count'] > 0)),
            ],
        ]);
    }

    /**
     * GET /api/v1/brands/{slug}
     */
    public function show(string $slug)
    {
        $brand = Brand::where('slug', $slug)
            ->where('status', 0)
            ->firstOrFail();

        return response()->json([
            'data' => $this->brandPayload($brand),
        ]);
    }

    /**
     * GET /api/v1/brands/{slug}/products
     *
     * ?q=&category=<slug>&remark=hit|sale|new&price_from=&price_to=
     * &sort=default|date|price|price-desc&page=&per_page=
     *
     * Выборка жёстко привязана к бренду (brandScope в ProductFilters),
     * поэтому facets — категории, цена и подборки — считаются внутри
     * ассортимента конкретного бренда.
     */
    public function products(Request $request, string $slug)
    {
        $brand = Brand::where('slug', $slug)
            ->where('status', 0)
            ->firstOrFail();

        $categoryIds = null;

        if ($catSlug = trim((string) $request->query('category', ''))) {
            $category = CategoryTree::findActiveBySlug($catSlug);
            // Несуществующая категория — пустая выборка, но без 404
            $categoryIds = $category ? CategoryTree::descendantIds($category->id, 5) : [0];
        }

        $filters = ProductFilters::fromRequest($request, $categoryIds, $brand->id);

        $q = Product::with(['images', 'brand']);
        $filters->apply($q);
        $filters->applySort($q);

        $products = $q->paginate($filters->perPage())->withQueryString();

        return ProductListResource::collection($products)->additional([
            'brand'   => $this->brandPayload($brand),
            'filters' => [
                'categories' => $filters->categoryFacets(),
                'price'      => $filters->priceFacet(),
                'remarks'    => $filters->remarkFacets(),
            ],
        ]);
    }

    /**
     * Бренд + агрегаты для шапки страницы: сколько товаров,
     * в скольких разделах представлен, минимальная цена.
     */
    private function brandPayload(Brand $brand): array
    {
        $base = Product::where('status', 0)->where('brand_id', $brand->id);

        $total = (clone $base)->count();

        $categoriesCount = (clone $base)
            ->whereNotNull('category_id')
            ->distinct()
            ->count('category_id');

        $priceRow = (clone $base)
            ->whereRaw(ProductFilters::EFFECTIVE . ' > 0')
            ->selectRaw('MIN(' . ProductFilters::EFFECTIVE . ') as min_price')
            ->first();

        $minPrice = (int) ($priceRow->min_price ?? 0);

        return array_merge((new BrandResource($brand))->resolve(), [
            'products_count'   => $total,
            'categories_count' => $categoriesCount,
            'min_price'        => $minPrice ?: null,
        ]);
    }
}
