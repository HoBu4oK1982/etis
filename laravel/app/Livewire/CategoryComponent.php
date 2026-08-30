<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Category;
use App\Models\Product;
use App\Models\Brand;

class CategoryComponent extends Component
{
    use WithPagination;

    public string $slug;
    public ?string $path = null;

    /** @var string[] */
    public array $pathSegments = [];

    public Category $rootCategory;
    public Category $currentCategory;

    // Filters
    // NOTE: keep as strings so that clearing <input type="number"> really becomes "" and we can treat it as NULL.
    // If typed as float/int, Livewire may cast "" to 0 which breaks "clear" behaviour.
    public ?string $brand_id = null;
    public ?string $price_from = null;
    public ?string $price_to = null;
    public string $sort = 'default';

    // UI: which nodes are expanded in the left tree
    public array $expanded = [];

    protected $queryString = [
        'brand_id' => ['except' => null],
        'price_from' => ['except' => null],
        'price_to' => ['except' => null],
        'sort' => ['except' => 'default'],
        'page' => ['except' => 1],
    ];

    public function mount(string $slug, ?string $path = null)
    {
        $this->slug = $slug;
        $this->path = $path;

        $root = Category::query()
            ->whereNull('parent_id')
            ->where('status', 0)
            ->where('slug', $slug)
            ->firstOrFail();

        $this->rootCategory = $root;
        $this->currentCategory = $root;

        $segments = [];
        if (!empty($path)) {
            $segments = array_values(array_filter(explode('/', trim($path, '/'))));
        }

        // Walk down strictly by parent_id to support up to 5 levels (or less)
        $current = $root;
        foreach ($segments as $seg) {
            $current = Category::query()
                ->where('parent_id', $current->id)
                ->where('slug', $seg)
                ->where('status', 0)
                ->firstOrFail();
            $this->pathSegments[] = $seg;
        }

        $this->currentCategory = $current;

        // Expand chain from root to current category in tree
        $chain = $this->getParentChain($this->currentCategory);
        foreach ($chain as $node) {
            $this->expanded[$node->id] = true;
        }

        // ✅ Read filters from URL on first load (stable across Livewire 3 builds)
        $this->brand_id = request()->query('brand_id', null);
        $this->price_from = request()->query('price_from', null);
        $this->price_to = request()->query('price_to', null);
        $this->sort = request()->query('sort', 'default');

        $this->normalizeFilters();
    }

    /**
     * Normalize incoming filter values.
     */
    private function normalizeFilters(): void
    {
        $this->brand_id = ($this->brand_id === '' ? null : $this->brand_id);
        $this->price_from = ($this->price_from === '' ? null : $this->price_from);
        $this->price_to = ($this->price_to === '' ? null : $this->price_to);

        if (!in_array($this->sort, ['default', 'date', 'price', 'price-desc'], true)) {
            $this->sort = 'default';
        }
    }

    /**
     * Base URL of the current category page (without query string).
     */
    private function baseUrl(): string
    {
        $path = implode('/', $this->pathSegments);

        return empty($path)
            ? route('category', ['slug' => $this->rootCategory->slug])
            : route('category.path', ['slug' => $this->rootCategory->slug, 'path' => $path]);
    }

    /**
     * Build query params from current filter state.
     */
    private function buildQueryParams(): array
    {
        $this->normalizeFilters();

        $params = [];

        if (!empty($this->brand_id)) {
            $params['brand_id'] = $this->brand_id;
        }
        if ($this->price_from !== null && $this->price_from !== '' && is_numeric($this->price_from)) {
            $params['price_from'] = $this->price_from;
        }
        if ($this->price_to !== null && $this->price_to !== '' && is_numeric($this->price_to)) {
            $params['price_to'] = $this->price_to;
        }
        if ($this->sort !== 'default') {
            $params['sort'] = $this->sort;
        }

        return $params;
    }

    /**
     * ✅ Sync filters to URL reliably (works even when Livewire queryString doesn't update).
     */
    private function syncUrl(): void
    {
        $url = $this->baseUrl();
        $params = $this->buildQueryParams();

        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }

        $this->redirect($url, navigate: true);
    }

    // Filter change hooks (Livewire 3)
    public function updatedBrandId(): void
    {
        $this->resetPage();
        $this->syncUrl();
    }

    public function updatedPriceFrom(): void
    {
        $this->resetPage();
        $this->syncUrl();
    }

    public function updatedPriceTo(): void
    {
        $this->resetPage();
        $this->syncUrl();
    }

    public function updatedSort(): void
    {
        $this->resetPage();
        $this->syncUrl();
    }

    public function toggleExpand(int $categoryId): void
    {
        $this->expanded[$categoryId] = !($this->expanded[$categoryId] ?? false);
    }

    public function clearFilters(): void
    {
        $this->brand_id = null;
        $this->price_from = null;
        $this->price_to = null;
        $this->sort = 'default';
        $this->resetPage();

        // ✅ Ensure URL is also cleared
        $this->redirect($this->baseUrl(), navigate: true);
    }

    /**
     * Returns chain from root to the given node (including node).
     */
    private function getParentChain(Category $node): array
    {
        $chain = [];
        $current = $node;

        while ($current) {
            array_unshift($chain, $current);
            if (empty($current->parent_id)) {
                break;
            }
            $current = Category::query()->find($current->parent_id);
        }

        return $chain;
    }

    /**
     * Collect descendant IDs up to $maxDepth (including $categoryId).
     */
    private function getDescendantIds(int $categoryId, int $maxDepth = 5): array
    {
        $all = [$categoryId];
        $level = [$categoryId];

        for ($depth = 1; $depth <= $maxDepth; $depth++) {
            $children = Category::query()
                ->whereIn('parent_id', $level)
                ->where('status', 0)
                ->pluck('id')
                ->all();

            if (empty($children)) {
                break;
            }

            $all = array_merge($all, $children);
            $level = $children;
        }

        return array_values(array_unique($all));
    }

    private function productsQuery(array $categoryIds)
    {
        // In DB, many products may have selling_price = NULL.
        // For filtering/sorting we use the effective price: COALESCE(selling_price, price).
        $effectivePriceSql = "CAST(NULLIF(COALESCE(selling_price, price), '') AS UNSIGNED)";

        $q = Product::query()
            ->with(['images', 'brand'])
            ->whereIn('category_id', $categoryIds)
            ->where('status', 0);

        if (!empty($this->brand_id)) {
            $q->where('brand_id', (int) $this->brand_id);
        }

        if ($this->price_from !== null && $this->price_from !== '' && is_numeric($this->price_from)) {
            $q->whereRaw("{$effectivePriceSql} >= ?", [(int) $this->price_from]);
        }

        if ($this->price_to !== null && $this->price_to !== '' && is_numeric($this->price_to)) {
            $q->whereRaw("{$effectivePriceSql} <= ?", [(int) $this->price_to]);
        }

        switch ($this->sort) {
            case 'price':
                $q->orderByRaw("({$effectivePriceSql} = 0) ASC")
                  ->orderByRaw("{$effectivePriceSql} ASC")
                  ->orderByDesc('id');
                break;
            case 'price-desc':
                $q->orderByRaw("({$effectivePriceSql} = 0) ASC")
                  ->orderByRaw("{$effectivePriceSql} DESC")
                  ->orderByDesc('id');
                break;
            case 'date':
                $q->orderByDesc('created_at')->orderByDesc('id');
                break;
            default:
                $q->orderByDesc('id');
        }

        return $q;
    }

    private function breadcrumbs(): array
{
    $crumbs = [];
    $crumbs[] = ['title' => 'Магазин', 'url' => route('shop')];

    // Root category always
    $crumbs[] = [
        'title' => $this->rootCategory->title,
        'url' => route('category', ['slug' => $this->rootCategory->slug]),
    ];

    // Nested levels (2+)
    if (!empty($this->pathSegments)) {
        $accum = [];
        foreach ($this->pathSegments as $i => $seg) {
            $accum[] = $seg;

            $chain = $this->getParentChain($this->currentCategory);
            $titleNode = $chain[$i + 1] ?? null;

            $crumbs[] = [
                'title' => $titleNode ? $titleNode->title : $seg,
                'url' => route('category.path', [
                    'slug' => $this->rootCategory->slug,
                    'path' => implode('/', $accum),
                ]),
            ];
        }
    }

    return $crumbs;
}


public function render()
    {
        $effectivePriceSql = "CAST(NULLIF(COALESCE(selling_price, price), '') AS UNSIGNED)";

        // Build tree for sidebar (root children up to 5 levels, only active)
        $rootTree = Category::query()
            ->with(['activeChildren.activeChildren.activeChildren.activeChildren'])
            ->where('id', $this->rootCategory->id)
            ->first();

        // Products are taken from the currently selected node subtree (max 5 levels)
        $categoryIds = $this->getDescendantIds($this->currentCategory->id, 5);
        $products = $this->productsQuery($categoryIds)->paginate(24);

        // Brands that exist in the current subtree (taking current filters except brand)
        $brandBaseQuery = Product::query()->whereIn('category_id', $categoryIds)->where('status', 0);
        if ($this->price_from !== null && $this->price_from !== '' && is_numeric($this->price_from)) {
            $brandBaseQuery->whereRaw("{$effectivePriceSql} >= ?", [(int) $this->price_from]);
        }
        if ($this->price_to !== null && $this->price_to !== '' && is_numeric($this->price_to)) {
            $brandBaseQuery->whereRaw("{$effectivePriceSql} <= ?", [(int) $this->price_to]);
        }

        $brandIds = $brandBaseQuery->distinct()->pluck('brand_id')->filter()->all();
        $brands = Brand::query()->whereIn('id', $brandIds)->orderBy('title')->get();

        return view('livewire.category-component', [
            'rootTree' => $rootTree,
            'rootCategory' => $this->rootCategory,
            'currentCategory' => $this->currentCategory,
            'products' => $products,
            'brands' => $brands,
            'breadcrumbs' => $this->breadcrumbs(),
        ])->layout('layouts.base');
    }
}
