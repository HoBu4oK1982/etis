<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ProductListResource;
use App\Http\Resources\V1\ProductResource;
use App\Models\Product;
use App\Support\CategoryTree;
use App\Support\ProductFilters;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/v1/products
     *
     * ?q=&category=<slug>&brand_id=1,5,9&remark=hit|sale|new
     * &price_from=&price_to=&sort=default|date|price|price-desc&page=&per_page=
     *
     * Используется на /shop и как fallback-поиск. Логика фильтров общая
     * с /categories/{slug}/products — см. App\Support\ProductFilters.
     */
    public function index(Request $request)
    {
        $categoryIds = null;

        if ($catSlug = trim((string) $request->query('category', ''))) {
            $category = CategoryTree::findActiveBySlug($catSlug);
            // Несуществующая категория — пустая выборка, но без 404:
            // фронт покажет «ничего не найдено» вместо ошибки.
            $categoryIds = $category ? CategoryTree::descendantIds($category->id, 5) : [0];
        }

        $filters = ProductFilters::fromRequest($request, $categoryIds);

        $q = Product::with(['images', 'brand']);
        $filters->apply($q);
        $filters->applySort($q);

        $products = $q->paginate($filters->perPage())->withQueryString();

        // Facets: бренды и цена — из общего метода, плюс категории
        // отдельно (тот же формат CategoryTile, что и в /categories/top).
        // Это позволяет собрать сайдбар для узких страниц (/hits, /sales,
        // /news) с фильтром по разделу без второго запроса.
        $facets = $filters->facets();
        $facets['categories'] = $filters->categoryFacets();

        return ProductListResource::collection($products)
            ->additional(['filters' => $facets]);
    }

    /**
     * GET /api/v1/products/{slug}
     * Полная карточка + related.
     */
    public function show(string $slug)
    {
        $product = Product::with([
                'images',
                'attributes',
                'brand',
                'category.parent.parent',
            ])
            ->where('slug', $slug)
            ->where('status', 0)
            ->firstOrFail();

        $related = Product::with(['images', 'brand'])
            ->where('status', 0)
            ->where('id', '!=', $product->id)
            ->when($product->category_id, fn($q) => $q->where('category_id', $product->category_id))
            ->inRandomOrder()
            ->limit(4)
            ->get();

        // Если в той же категории мало — добираем случайными
        if ($related->count() < 4) {
            $extra = Product::with(['images', 'brand'])
                ->where('status', 0)
                ->where('id', '!=', $product->id)
                ->whereNotIn('id', $related->pluck('id'))
                ->inRandomOrder()
                ->limit(4 - $related->count())
                ->get();
            $related = $related->concat($extra);
        }

        return response()->json([
            'data'    => new ProductResource($product),
            'related' => ProductListResource::collection($related),
        ]);
    }

    /**
     * POST /api/v1/cart/validate
     * Body: { items: [{ product_id, qty }] }
     * Возвращает актуальные цены и статус — чтобы не подделали цену на клиенте.
     */
    public function validateCart(Request $request)
    {
        $items = $request->input('items', []);
        $ids   = collect($items)->pluck('product_id')->filter()->unique()->values();

        $products = Product::whereIn('id', $ids)
            ->where('status', 0)
            ->get()
            ->keyBy('id');

        $result = [];
        $subtotal = 0;

        foreach ($items as $item) {
            $pid = (int) ($item['product_id'] ?? 0);
            $qty = max(1, (int) ($item['qty'] ?? 1));
            $p   = $products->get($pid);

            if (!$p) {
                $result[] = [
                    'product_id' => $pid,
                    'available'  => false,
                    'reason'     => 'not_found',
                ];
                continue;
            }

            $price = $p->selling_price && $p->selling_price > 0
                ? (float) $p->selling_price
                : (float) $p->price;

            $subtotal += $price * $qty;

            $result[] = [
                'product_id' => $p->id,
                'available'  => true,
                'title'      => $p->title,
                'slug'       => $p->slug,
                'price'      => $price,
                'qty'        => $qty,
                'sum'        => $price * $qty,
            ];
        }

        return response()->json([
            'data' => [
                'items'    => $result,
                'subtotal' => $subtotal,
                'total'    => $subtotal, // пока без доставки/скидок
            ],
        ]);
    }
}
