<?php

namespace App\Support;

use App\Http\Resources\V1\BrandResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Фильтры каталога, общие для /products и /categories/{slug}/products.
 *
 * Разбирает query-параметры один раз и умеет:
 *  - навешивать условия на выборку (apply);
 *  - сортировать (applySort);
 *  - считать facets — бренды со счётчиками и диапазон цен.
 *
 * Важная деталь facets: список брендов считается БЕЗ учёта фильтра по
 * бренду, а диапазон цен — БЕЗ учёта фильтра по цене. Иначе после
 * первого выбора список схлопывался бы до выбранного значения и снять
 * фильтр было бы нечем.
 */
final class ProductFilters
{
    /** Эффективная цена: selling_price ?? price */
    public const EFFECTIVE = "CAST(NULLIF(COALESCE(selling_price, price), '') AS UNSIGNED)";

    private function __construct(
        private readonly string $search,
        private readonly ?string $remark,
        private readonly array $brandIds,
        private readonly ?int $priceFrom,
        private readonly ?int $priceTo,
        private readonly string $sort,
        private readonly int $perPage,
        private readonly ?array $categoryIds,
        /**
         * Жёсткая привязка выборки к бренду (страница /brands/{slug}).
         * Применяется ВСЕГДА, в том числе при расчёте facets — иначе
         * счётчики категорий и диапазон цен считались бы по всему каталогу.
         */
        private readonly ?int $brandScopeId = null,
    ) {
    }

    /**
     * @param int[]|null $categoryIds  ID категории и её поддерева (null — без ограничения)
     * @param int|null   $brandScopeId ID бренда, к которому жёстко привязана выборка
     */
    public static function fromRequest(
        Request $request,
        ?array $categoryIds = null,
        ?int $brandScopeId = null
    ): self {
        $remark = $request->query('remark');
        $remark = in_array($remark, ['hit', 'sale', 'new'], true) ? $remark : null;

        // brand_id=1,5,9 — мультивыбор
        $brandIds = collect(explode(',', (string) $request->query('brand_id', '')))
            ->map(fn ($v) => (int) trim($v))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $sort = (string) $request->query('sort', 'default');
        if (!in_array($sort, ['default', 'date', 'price', 'price-desc'], true)) {
            $sort = 'default';
        }

        return new self(
            search: trim((string) $request->query('q', '')),
            remark: $remark,
            brandIds: $brandIds,
            priceFrom: is_numeric($request->query('price_from')) ? (int) $request->query('price_from') : null,
            priceTo: is_numeric($request->query('price_to')) ? (int) $request->query('price_to') : null,
            sort: $sort,
            perPage: min(max((int) $request->query('per_page', 24), 1), 60),
            categoryIds: $categoryIds,
            brandScopeId: $brandScopeId,
        );
    }

    /**
     * @param bool $withBrand    учитывать фильтр по брендам (для facets брендов — false)
     * @param bool $withPrice    учитывать фильтр по цене (для facet цены — false)
     * @param bool $withCategory учитывать фильтр по категории (для facets категорий — false)
     * @param bool $withRemark   учитывать фильтр по подборке (для facets подборок — false)
     */
    public function apply(
        Builder $q,
        bool $withBrand = true,
        bool $withPrice = true,
        bool $withCategory = true,
        bool $withRemark = true
    ): Builder {
        $q->where('status', 0);

        // Скоуп бренда снимать нельзя ни при каких facets
        if ($this->brandScopeId !== null) {
            $q->where('brand_id', $this->brandScopeId);
        }

        if ($withCategory && $this->categoryIds !== null) {
            $q->whereIn('category_id', $this->categoryIds);
        }

        if ($this->search !== '') {
            $search = $this->search;
            // Группируем в замыкание: иначе orWhereHas сломает приоритет AND-условий
            $q->where(function ($sub) use ($search) {
                $sub->where('title', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhereHas('brand', function ($b) use ($search) {
                        $b->where('title', 'like', "%{$search}%");
                    });
            });
        }

        if ($withRemark && $this->remark) {
            $q->where('remark', $this->remark);
        }

        if ($withBrand && !empty($this->brandIds)) {
            $q->whereIn('brand_id', $this->brandIds);
        }

        if ($withPrice && $this->priceFrom !== null) {
            $q->whereRaw(self::EFFECTIVE . ' >= ?', [$this->priceFrom]);
        }
        if ($withPrice && $this->priceTo !== null) {
            $q->whereRaw(self::EFFECTIVE . ' <= ?', [$this->priceTo]);
        }

        return $q;
    }

    public function applySort(Builder $q): Builder
    {
        $effective = self::EFFECTIVE;

        switch ($this->sort) {
            case 'price':
                $q->orderByRaw("({$effective} = 0) ASC")
                  ->orderByRaw("{$effective} ASC")
                  ->orderByDesc('id');
                break;
            case 'price-desc':
                $q->orderByRaw("({$effective} = 0) ASC")
                  ->orderByRaw("{$effective} DESC")
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

    public function perPage(): int
    {
        return $this->perPage;
    }

    /**
     * @return array{brands: array, price: array{min: int, max: int}}
     */
    public function facets(): array
    {
        return [
            'brands' => $this->brandFacets(),
            'price'  => $this->priceFacet(),
        ];
    }

    private function brandFacets(): array
    {
        $q = Product::query();
        $this->apply($q, withBrand: false);

        $counts = $q->whereNotNull('brand_id')
            ->selectRaw('brand_id, COUNT(*) as aggregate_count')
            ->groupBy('brand_id')
            ->pluck('aggregate_count', 'brand_id')
            ->all();

        if (empty($counts)) {
            return [];
        }

        return Brand::whereIn('id', array_keys($counts))
            ->orderBy('title')
            ->get()
            ->map(fn ($brand) => array_merge(
                (new BrandResource($brand))->resolve(),
                ['products_count' => (int) ($counts[$brand->id] ?? 0)]
            ))
            ->all();
    }

    /**
     * Facets категорий для выборки, ограниченной брендом.
     *
     * Формат совпадает с CategoryTile на фронте (categories/top), чтобы
     * можно было переиспользовать готовый <FilterCategories>: корневые
     * категории + второй уровень, счётчики — по всему поддереву.
     *
     * Считается БЕЗ учёта фильтра по категории — иначе после первого
     * выбора список схлопнулся бы до одной ветки.
     */
    public function categoryFacets(): array
    {
        $q = Product::query();
        $this->apply($q, withCategory: false);

        $own = $q->whereNotNull('category_id')
            ->selectRaw('category_id, COUNT(*) as aggregate_count')
            ->groupBy('category_id')
            ->pluck('aggregate_count', 'category_id')
            ->all();

        if (empty($own)) {
            return [];
        }

        $categories = Category::where('status', 0)
            ->orderBy('position')
            ->orderBy('title')
            ->get(['id', 'parent_id', 'title', 'slug', 'subtitle', 'short_description', 'image', 'position'])
            ->keyBy('id');

        // Поднимаем счётчики вверх по дереву: у корня — сумма всего поддерева
        $totals = [];
        foreach ($own as $categoryId => $count) {
            $id    = (int) $categoryId;
            $guard = 0;

            while ($id > 0 && isset($categories[$id]) && $guard++ < 10) {
                $totals[$id] = ($totals[$id] ?? 0) + (int) $count;
                $id = (int) ($categories[$id]->parent_id ?? 0);
            }
        }

        // Корень — либо без parent_id, либо с неактивным/удалённым родителем
        $isRoot = function ($category) use ($categories): bool {
            $parentId = (int) ($category->parent_id ?? 0);
            return $parentId === 0 || !isset($categories[$parentId]);
        };

        $out = [];

        foreach ($categories as $category) {
            if (!$isRoot($category) || empty($totals[$category->id])) {
                continue;
            }

            $children = [];
            foreach ($categories as $child) {
                if ((int) $child->parent_id !== (int) $category->id) {
                    continue;
                }
                if (empty($totals[$child->id])) {
                    continue;
                }

                $children[] = [
                    'id'             => (int) $child->id,
                    'title'          => (string) $child->title,
                    'slug'           => (string) $child->slug,
                    'products_count' => (int) $totals[$child->id],
                ];
            }

            $out[] = [
                'id'                => (int) $category->id,
                'title'             => (string) $category->title,
                'slug'              => (string) $category->slug,
                'subtitle'          => $category->subtitle,
                'short_description' => $category->short_description,
                'image'             => $category->image
                    ? asset('assets/images/categories/' . $category->image)
                    : null,
                'position'          => (int) $category->position,
                'products_count'    => (int) $totals[$category->id],
                'children'          => $children,
            ];
        }

        usort($out, fn ($a, $b) => $b['products_count'] <=> $a['products_count']);

        return $out;
    }

    /**
     * Счётчики подборок (хит / новинка / акция) для текущей выборки.
     * Считаются без учёта самого фильтра по remark.
     *
     * @return array{hit: int, new: int, sale: int}
     */
    public function remarkFacets(): array
    {
        $q = Product::query();
        $this->apply($q, withRemark: false);

        $rows = $q->whereNotNull('remark')
            ->selectRaw('remark, COUNT(*) as aggregate_count')
            ->groupBy('remark')
            ->pluck('aggregate_count', 'remark')
            ->all();

        return [
            'hit'  => (int) ($rows['hit'] ?? 0),
            'new'  => (int) ($rows['new'] ?? 0),
            'sale' => (int) ($rows['sale'] ?? 0),
        ];
    }

    public function priceFacet(): array
    {
        $q = Product::query();
        $this->apply($q, withPrice: false);

        $row = $q->whereRaw(self::EFFECTIVE . ' > 0')
            ->selectRaw(
                'MIN(' . self::EFFECTIVE . ') as min_price, MAX(' . self::EFFECTIVE . ') as max_price'
            )
            ->first();

        return [
            'min' => (int) ($row->min_price ?? 0),
            'max' => (int) ($row->max_price ?? 0),
        ];
    }
}
