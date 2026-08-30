<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\CategoryResource;
use App\Http\Resources\V1\CategoryTreeResource;
use App\Http\Resources\V1\ProductListResource;
use App\Models\Category;
use App\Models\Product;
use App\Support\CategoryTree;
use App\Support\ProductFilters;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * GET /api/v1/categories/tree
     * Полное дерево активных категорий до 5 уровней (для меню/сайдбара).
     */
    public function tree()
    {
        $roots = Category::whereNull('parent_id')
            ->where('status', 0)
            ->with(['activeChildren.activeChildren.activeChildren.activeChildren'])
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => CategoryTreeResource::collection($roots),
        ]);
    }

    /**
     * GET /api/v1/categories/top
     *
     * Категории верхнего уровня с картинкой, подзаголовком, минитекстом,
     * счётчиком товаров по всему поддереву и вторым уровнем вложенности.
     *
     * Используется на странице /shop (витрина категорий + фильтр в сайдбаре)
     * и может быть переиспользована на главной.
     */
    public function top()
    {
        $categories = Category::where('status', 0)
            ->orderBy('position')
            ->orderBy('id')
            ->get(['id', 'parent_id', 'title', 'slug', 'subtitle', 'short_description', 'image', 'position']);

        $counts = CategoryTree::subtreeCounts();

        $childrenMap = [];
        foreach ($categories as $c) {
            $childrenMap[$c->parent_id ?? 0][] = $c;
        }

        $data = [];

        foreach ($childrenMap[0] ?? [] as $root) {
            $children = [];

            foreach ($childrenMap[$root->id] ?? [] as $child) {
                $children[] = [
                    'id'             => (int) $child->id,
                    'title'          => (string) $child->title,
                    'slug'           => (string) $child->slug,
                    'products_count' => (int) ($counts[$child->id] ?? 0),
                ];
            }

            $data[] = [
                'id'                => (int) $root->id,
                'title'             => (string) $root->title,
                'slug'              => (string) $root->slug,
                'subtitle'          => $root->subtitle,
                'short_description' => $root->short_description,
                'image'             => $root->image
                    ? asset('assets/images/categories/' . $root->image)
                    : null,
                'position'          => (int) $root->position,
                'products_count'    => (int) ($counts[$root->id] ?? 0),
                'children'          => $children,
            ];
        }

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/v1/categories/{slug}
     * ?path=level2/level3/... — опциональный путь для вложенной категории.
     * Возвращает root, current, breadcrumbs, поддерево для сайдбара.
     */
    public function show(Request $request, string $slug)
    {
        $root = Category::whereNull('parent_id')
            ->where('status', 0)
            ->where('slug', $slug)
            ->firstOrFail();

        $current = $root;
        $pathSegments = [];

        if ($path = $request->query('path')) {
            $segments = array_values(array_filter(explode('/', trim($path, '/'))));
            foreach ($segments as $seg) {
                $current = Category::where('parent_id', $current->id)
                    ->where('slug', $seg)
                    ->where('status', 0)
                    ->firstOrFail();
                $pathSegments[] = $seg;
            }
        }

        // Поддерево от root (для сайдбара)
        $rootWithTree = Category::where('id', $root->id)
            ->with(['activeChildren.activeChildren.activeChildren.activeChildren'])
            ->first();

        // Хлебные крошки: root -> ... -> current
        $chain = $this->parentChain($current);
        $accum = [];
        $breadcrumbs = [];
        foreach ($chain as $i => $node) {
            if ($i === 0) {
                $breadcrumbs[] = [
                    'title' => $node->title,
                    'slug'  => $node->slug,
                    'url'   => '/category/' . $node->slug,
                ];
                continue;
            }
            $accum[] = $node->slug;
            $breadcrumbs[] = [
                'title' => $node->title,
                'slug'  => $node->slug,
                'url'   => '/category/' . $root->slug . '/' . implode('/', $accum),
            ];
        }

        return response()->json([
            'data' => [
                'root'          => new CategoryResource($root),
                'current'       => new CategoryResource($current),
                'path_segments' => $pathSegments,
                'tree'          => new CategoryTreeResource($rootWithTree),
                'breadcrumbs'   => $breadcrumbs,
                // [category_id => кол-во товаров с учётом поддерева] —
                // для счётчиков в аккордеоне подкатегорий
                'counts'        => CategoryTree::subtreeCounts(),
            ],
        ]);
    }

    /**
     * GET /api/v1/categories/{slug}/products
     * ?path=&brand_id=1,5,9&remark=&price_from=&price_to=&sort=&page=&per_page=
     *
     * Товары берутся из всего поддерева текущей категории (до 5 уровней).
     * Набор фильтров и facets идентичен /products — общая логика лежит
     * в App\Support\ProductFilters.
     */
    public function products(Request $request, string $slug)
    {
        $root = Category::whereNull('parent_id')
            ->where('status', 0)
            ->where('slug', $slug)
            ->firstOrFail();

        $current = $this->resolvePath($root, $request->query('path'));

        $categoryIds = CategoryTree::descendantIds($current->id, 5);
        $filters     = ProductFilters::fromRequest($request, $categoryIds);

        $q = Product::with(['images', 'brand']);
        $filters->apply($q);
        $filters->applySort($q);

        $products = $q->paginate($filters->perPage())->withQueryString();

        return ProductListResource::collection($products)
            ->additional(['filters' => $filters->facets()]);
    }

    /**
     * Спуск по ?path=level2/level3 от корневой категории.
     * Несуществующий сегмент — 404, чтобы битые URL не отдавали
     * товары родителя как ни в чём не бывало.
     */
    private function resolvePath(Category $root, ?string $path): Category
    {
        $current = $root;

        if (!$path) {
            return $current;
        }

        foreach (array_values(array_filter(explode('/', trim($path, '/')))) as $seg) {
            $current = Category::where('parent_id', $current->id)
                ->where('slug', $seg)
                ->where('status', 0)
                ->firstOrFail();
        }

        return $current;
    }

    /**
     * Цепочка от корня до узла включительно.
     * @return array<int, Category>
     */
    private function parentChain(Category $node): array
    {
        $chain = [];
        $current = $node;

        while ($current) {
            array_unshift($chain, $current);
            if (empty($current->parent_id)) {
                break;
            }
            $current = Category::find($current->parent_id);
        }

        return $chain;
    }
}
