<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

use App\Search\SearchEngine;
use App\Search\Index\DocumentRepository;
use App\Search\Linguistics\Tokenizer;

use App\Models\SearchQueryLog;
use App\Models\SearchTerm;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Article;

/**
 * Умный поиск etis.kz.
 *
 * Endpoints:
 *   GET  /api/v1/search?q=...                — полная страница поиска
 *   GET  /api/v1/search/suggest?q=...        — быстрые подсказки для шапки
 *   GET  /api/v1/search/popular              — популярные запросы
 *   GET  /api/v1/search/no-results?limit=... — агрегированные пустые запросы (аналитика)
 *   POST /api/v1/search/no-results           — фронт логирует пустой suggest
 *   POST /api/v1/search/click                — фронт логирует клик по результату
 */
class SearchController extends Controller
{
    protected const LOCALE = 'ru';

    protected function engine(): SearchEngine
    {
        return new SearchEngine(new DocumentRepository());
    }

    /* ==================== Публичные эндпоинты ==================== */

    /** GET /api/v1/search?q=&type=&limit= */
    public function search(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        if (mb_strlen($q) < 2) {
            return response()->json([
                'query' => $q,
                'total' => 0,
                'results' => [],
                'groups' => [],
                'corrected' => null,
            ]);
        }

        $type = $request->query('type');
        $limit = min((int) $request->query('limit', 20), 120);

        // Основной путь через search_documents. Если индекс пуст / устарел /
        // структура сломана — движок кинет исключение; ловим и продолжаем
        // с БД-фолбэком, чтобы фронт не остался с пустым списком.
        try {
            $result = $this->engine()->search($q, [
                'locale' => self::LOCALE,
                'type' => $type,
                'limit' => $limit,
                'mode' => 'search',
            ]);
        } catch (\Throwable $e) {
            report($e);
            $result = ['query' => $q, 'corrected' => null, 'total' => 0, 'results' => [], 'groups' => []];
        }

        // Фолбэк по БД — всегда дополняем движок (не только когда пусто).
        // На этой странице ищем широко: title + keywords + description.
        $fallback = $this->databaseFallback($q, is_string($type) ? $type : null, $limit, true);
        if ((int) ($fallback['total'] ?? 0) > 0) {
            $result = $this->mergeSearchPayloads($result, $fallback, $limit);
        }

        $this->logQuery($q, (int) ($result['total'] ?? 0), $request->ip());

        return response()->json($result);
    }

    /** GET /api/v1/search/suggest?q=&limit= */
    public function suggest(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        if (mb_strlen($q) < 2) {
            return response()->json([
                'query' => $q,
                'suggestions' => [],
                'products' => [],
                'popular' => $this->popularList(),
            ]);
        }

        $limit = min((int) $request->query('limit', 8), 12);

        try {
            $data = $this->engine()->suggest($q, [
                'locale' => self::LOCALE,
                'limit' => $limit,
            ]);
        } catch (\Throwable $e) {
            report($e);
            $data = ['query' => $q, 'corrected' => null, 'suggestions' => [], 'products' => []];
        }

        if (empty($data['suggestions']) && empty($data['products'])) {
            // Strict-фолбэк: title + SKU + brand + category (без description).
            $fallback = $this->databaseFallback($q, null, $limit, false);
            // Если совсем пусто — включаем широкий фолбэк (с description/body).
            if ((int) ($fallback['total'] ?? 0) === 0) {
                $fallback = $this->databaseFallback($q, null, $limit, true);
            }
            if ((int) ($fallback['total'] ?? 0) > 0) {
                $results = array_slice($fallback['results'], 0, $limit);
                $data = [
                    'query' => $q,
                    'corrected' => $fallback['corrected'] ?? null,
                    'suggestions' => array_map(fn ($r) => [
                        'text' => $r['title'],
                        'type' => $r['type'],
                        'url' => $r['url'],
                        'score' => $r['score'] ?? 0,
                    ], $results),
                    'products' => array_values(array_filter($results, fn ($r) => ($r['type'] ?? null) === 'product')),
                ];
            }
        }

        return response()->json($data);
    }

    /** GET /api/v1/search/popular */
    public function popular(Request $request)
    {
        return response()->json(['data' => $this->popularList()]);
    }

    /** POST /api/v1/search/click */
    public function click(Request $request)
    {
        $data = $request->validate([
            'query' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:30',
            'id' => 'nullable|integer',
        ]);

        if (! empty($data['query'])) {
            SearchQueryLog::create([
                'query' => $data['query'],
                'normalized' => Tokenizer::normalize($data['query']),
                'locale' => self::LOCALE,
                'results_count' => 0,
                'clicked_type' => $data['type'] ?? null,
                'clicked_id' => $data['id'] ?? null,
                'ip' => $request->ip(),
                'created_at' => now(),
            ]);

            foreach (Tokenizer::tokenize($data['query']) as $stem) {
                SearchTerm::where('term', 'LIKE', $stem . '%')
                    ->update(['popularity' => DB::raw('popularity + 1')]);
            }
        }

        return response()->json(['ok' => true]);
    }

    /** POST /api/v1/search/no-results */
    public function noResults(Request $request)
    {
        $data = $request->validate([
            'query' => 'required|string|min:2|max:255',
        ]);

        $this->logQuery(trim($data['query']), 0, $request->ip());
        return response()->json(['ok' => true]);
    }

    /** GET /api/v1/search/no-results?limit= — аналитика дыр в каталоге */
    public function noResultsList(Request $request)
    {
        $limit = min(max((int) $request->query('limit', 30), 1), 100);

        $data = SearchQueryLog::where('locale', self::LOCALE)
            ->where('results_count', 0)
            ->whereNull('clicked_type')
            ->whereNull('clicked_id')
            ->whereNotNull('normalized')
            ->where('normalized', '!=', '')
            ->select('normalized', DB::raw('COUNT(*) as count'), DB::raw('MAX(created_at) as last_seen'))
            ->groupBy('normalized')
            ->orderByDesc('count')
            ->orderByDesc('last_seen')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $data]);
    }

    /* ==================== БД-фолбэк (без индекса) ==================== */

    /**
     * Прямой SQL-поиск по моделям etis.kz. Используется:
     *   1) если движок сломался (индекс пуст/устарел),
     *   2) как дополнение к движку — расширяет выдачу совпадениями,
     *      которых нет в индексе.
     */
    protected function databaseFallback(string $q, ?string $type, int $limit, bool $includeBody = true): array
    {
        $variants = $this->queryVariants($q);
        $items = [];
        $seen = [];
        $corrected = null;

        foreach ($variants as $variant) {
            $batch = $this->databaseFallbackForVariant($variant, $type, $limit, $includeBody);
            if (! empty($batch)) {
                if ($variant !== $q) {
                    $corrected = ['query' => $variant];
                }
                foreach ($batch as $item) {
                    $key = ($item['type'] ?? 'x') . ':' . ($item['id'] ?? '0');
                    if (! isset($seen[$key])) {
                        $items[] = $item;
                        $seen[$key] = true;
                    }
                }
                break;
            }
        }

        $groups = $this->groupPresentedByType($items);
        $flat = $this->balanceFlatResults($items, $limit);

        return [
            'query' => $q,
            'corrected' => $corrected,
            'total' => count($flat),
            'results' => $flat,
            'groups' => $groups,
        ];
    }

    protected function databaseFallbackForVariant(string $variant, ?string $type, int $limit, bool $includeBody = true): array
    {
        $results = [];
        $perTypeLimit = max(8, min(60, $limit));

        // ---------- Товары ----------
        if ($type === null || $type === 'product') {
            $products = Product::with(['brand', 'category', 'images'])
                ->where('status', 0)
                ->where(function ($query) use ($variant, $includeBody) {
                    $this->applyProductSearchWhere($query, $variant, $includeBody);
                })
                ->limit($perTypeLimit)
                ->get();

            foreach ($products as $product) {
                $results[] = $this->presentProductFallback($product, $variant);
            }
        }

        // ---------- Категории ----------
        if ($type === null || $type === 'category') {
            $categories = Category::where('status', 0)
                ->where(function ($query) use ($variant, $includeBody) {
                    $columns = ['title', 'meta_title', 'meta_keywords', 'slug'];
                    if ($includeBody) {
                        $columns = array_merge($columns, ['description', 'meta_description']);
                    }
                    $this->applySimpleSearchWhere($query, $variant, $columns);
                })
                ->limit(30)
                ->get();

            foreach ($categories as $category) {
                $title = (string) ($category->title ?: $category->slug);
                $keywords = (string) ($category->meta_keywords ?? '');
                $body = $includeBody ? trim(implode(' ', array_filter([$category->description, $category->meta_description]))) : '';
                $results[] = $this->presentGenericFallback(
                    $category->id,
                    'category',
                    $title,
                    '/category/' . $category->slug,
                    $category->image ? asset('assets/images/categories/' . $category->image) : null,
                    $variant,
                    1.35,
                    $keywords,
                    $body
                );
            }
        }

        // ---------- Бренды ----------
        if ($type === null || $type === 'brand') {
            $brands = Brand::where('status', 0)
                ->where(function ($query) use ($variant, $includeBody) {
                    $columns = ['title', 'slug'];
                    if ($includeBody) {
                        $columns = array_merge($columns, ['description']);
                    }
                    $this->applySimpleSearchWhere($query, $variant, $columns);
                })
                ->limit(20)
                ->get();

            foreach ($brands as $brand) {
                $title = (string) ($brand->title ?: $brand->slug);
                $body = $includeBody ? (string) ($brand->description ?? '') : '';
                $results[] = $this->presentGenericFallback(
                    $brand->id,
                    'brand',
                    $title,
                    '/brands/' . $brand->slug,
                    $brand->image ? asset('assets/images/brands/' . $brand->image) : null,
                    $variant,
                    1.25,
                    $title,
                    $body
                );
            }
        }

        // ---------- Статьи ----------
        if ($type === null || $type === 'article') {
            $articles = Article::where('status', 0)
                ->where(function ($query) use ($variant, $includeBody) {
                    $columns = ['title', 'meta_title', 'meta_keywords', 'slug'];
                    if ($includeBody) {
                        $columns = array_merge($columns, ['short_description', 'description', 'meta_description']);
                    }
                    $this->applySimpleSearchWhere($query, $variant, $columns);
                })
                ->limit(20)
                ->get();

            foreach ($articles as $article) {
                $title = (string) ($article->title ?: $article->slug);
                $keywords = (string) ($article->meta_keywords ?? '');
                $body = $includeBody ? trim(implode(' ', array_filter([$article->short_description, $article->description, $article->meta_description]))) : '';
                $results[] = $this->presentGenericFallback(
                    $article->id,
                    'article',
                    $title,
                    '/article/' . $article->slug,
                    $article->image ? asset('assets/images/articles/' . $article->image) : null,
                    $variant,
                    0.58,
                    $keywords,
                    $body
                );
            }
        }

        usort($results, fn ($a, $b) => $this->comparePresentedResults($a, $b));
        return array_slice($results, 0, $limit);
    }

    protected function applyProductSearchWhere($query, string $variant, bool $includeBody = true): void
    {
        $columns = ['title', 'meta_title', 'meta_keywords', 'sku', 'slug'];
        if ($includeBody) {
            $columns = array_merge($columns, ['short_description', 'description', 'meta_description']);
        }
        $this->applySimpleSearchWhere($query, $variant, $columns);

        // Совпадение по бренду / категории — через orWhereHas
        $query->orWhereHas('brand', function ($brand) use ($variant) {
            $this->applySimpleSearchWhere($brand, $variant, ['title', 'slug']);
        });
        $query->orWhereHas('category', function ($category) use ($variant) {
            $this->applySimpleSearchWhere($category, $variant, ['title', 'meta_keywords', 'slug']);
        });
    }

    protected function applySimpleSearchWhere($query, string $variant, array $columns): void
    {
        $table = method_exists($query, 'getModel') ? $query->getModel()->getTable() : null;
        if ($table) {
            $columns = array_values(array_filter($columns, fn ($c) => Schema::hasColumn($table, $c)));
        }
        if (empty($columns)) return;

        $tokens = array_values(array_unique(array_filter(preg_split('/\s+/u', Tokenizer::normalize($variant), -1, PREG_SPLIT_NO_EMPTY))));
        $needles = array_values(array_unique(array_filter(array_merge([$variant], $tokens))));

        foreach ($columns as $column) {
            foreach ($needles as $needle) {
                $query->orWhere($column, 'LIKE', '%' . $this->escapeLike($needle) . '%');
            }
        }
    }

    /* ==================== Презентация fallback-результатов ==================== */

    protected function presentProductFallback(Product $product, string $variant): array
    {
        $title = (string) $product->title;
        $keywords = trim(implode(' ', array_filter([
            $product->meta_keywords,
            $product->sku,
            optional($product->brand)->title,
            optional($product->category)->title,
        ])));
        $body = trim(implode(' ', array_filter([
            $product->short_description,
            $product->description,
            $product->meta_description,
        ])));

        $scoreData = $this->fallbackScore($title, $keywords, $body, $variant, 1.75);
        $firstImage = optional($product->images->first())->file_name;

        return [
            'id' => $product->id,
            'type' => 'product',
            'title' => $title,
            'url' => '/product/' . $product->slug,
            'image' => $firstImage ? asset('assets/images/products/' . $firstImage) : null,
            'price' => $product->selling_price ?: $product->price,
            'currency' => 'KZT',
            'score' => $scoreData['score'],
            'match' => [
                'body_only' => false,
                'requires_body' => false,
                'matched_fields' => $scoreData['fields'],
                'manual_boost' => 0,
                'how' => ['fallback' => true],
            ],
        ];
    }

    protected function presentGenericFallback($id, string $type, ?string $title, ?string $url, ?string $image, string $variant, float $weight, string $keywords = '', string $body = ''): array
    {
        $scoreData = $this->fallbackScore((string) $title, $keywords, $body, $variant, $weight);

        return [
            'id' => $id,
            'type' => $type,
            'title' => $title,
            'url' => $url,
            'image' => $image,
            'price' => null,
            'currency' => null,
            'score' => $scoreData['score'],
            'match' => [
                'body_only' => false,
                'requires_body' => false,
                'matched_fields' => $scoreData['fields'],
                'manual_boost' => 0,
                'how' => ['fallback' => true],
            ],
        ];
    }

    protected function fallbackScore(string $title, string $keywords, string $body, string $variant, float $typeWeight): array
    {
        $q = Tokenizer::normalize($variant);
        $titleNorm = Tokenizer::normalize($title);
        $keywordsNorm = Tokenizer::normalize($keywords);
        $bodyNorm = Tokenizer::normalize($this->stripHtml($body));
        $score = 0.0;
        $fields = [];

        if ($q !== '' && $titleNorm === $q) {
            $score += 120; $fields[] = 'title';
        } elseif ($q !== '' && str_starts_with($titleNorm, $q)) {
            $score += 95; $fields[] = 'title';
        } elseif ($q !== '' && str_contains($titleNorm, $q)) {
            $score += 82; $fields[] = 'title';
        }

        $tokens = array_values(array_filter(preg_split('/\s+/u', $q, -1, PREG_SPLIT_NO_EMPTY)));
        $matchedTitleTokens = 0;
        foreach ($tokens as $token) {
            if (mb_strlen($token, 'UTF-8') < 2) continue;
            if (str_contains($titleNorm, $token)) {
                $matchedTitleTokens++;
            } elseif (str_contains($keywordsNorm, $token)) {
                $score += 14; $fields[] = 'keywords';
            } elseif (str_contains($bodyNorm, $token)) {
                $score += 4; $fields[] = 'body';
            }
        }

        if ($matchedTitleTokens > 0) {
            $score += 42 * ($matchedTitleTokens / max(1, count($tokens)));
            $fields[] = 'title';
        }

        if ($score <= 0 && $q !== '' && str_contains($keywordsNorm, $q)) {
            $score = 38; $fields[] = 'keywords';
        }
        if ($score <= 0 && $q !== '' && str_contains($bodyNorm, $q)) {
            $score = 12; $fields[] = 'body';
        }

        if (! empty($fields) && count(array_unique($fields)) === 1 && in_array('body', $fields, true)) {
            $score *= 0.72;
        }

        $fields = array_values(array_unique($fields ?: ['keywords']));
        return ['score' => round(max(1, $score) * $typeWeight, 3), 'fields' => $fields];
    }

    /* ==================== Слияние движка и fallback ==================== */

    protected function mergeSearchPayloads(array $primary, array $fallback, int $limit): array
    {
        $items = [];
        $seen = [];

        foreach (array_merge((array) ($primary['results'] ?? []), (array) ($fallback['results'] ?? [])) as $item) {
            $key = ($item['type'] ?? 'x') . ':' . ($item['id'] ?? '0');
            if (isset($seen[$key])) continue;
            $items[] = $item;
            $seen[$key] = true;
        }

        $groups = $this->groupPresentedByType($items);
        $flat = $this->balanceFlatResults($items, $limit);

        return [
            'query' => $primary['query'] ?? $fallback['query'] ?? '',
            'corrected' => $primary['corrected'] ?? $fallback['corrected'] ?? null,
            'total' => count($flat),
            'results' => $flat,
            'groups' => $groups,
        ];
    }

    /**
     * Плоский список для вкладки «Все»: товары резервируют до 70% лимита,
     * остаток распределяется между категориями/брендами/статьями с гарантированной
     * квотой на тип (иначе многочисленные категории могут выесть всё место).
     */
    protected function balanceFlatResults(array $items, int $limit): array
    {
        usort($items, fn ($a, $b) => $this->comparePresentedResults($a, $b));

        $products = array_values(array_filter($items, fn ($i) => (string) ($i['type'] ?? '') === 'product'));
        $others = array_values(array_filter($items, fn ($i) => (string) ($i['type'] ?? '') !== 'product'));

        if (empty($others))  return array_slice($products, 0, $limit);
        if (empty($products)) return array_slice($others, 0, $limit);

        $productBudget = (int) floor($limit * 0.7);
        $selectedProducts = array_slice($products, 0, $productBudget);
        $remaining = max(0, $limit - count($selectedProducts));
        $selectedOthers = $this->pickWithPerTypeQuota($others, $remaining);

        $result = array_merge($selectedProducts, $selectedOthers);
        usort($result, fn ($a, $b) => $this->comparePresentedResults($a, $b));
        return $result;
    }

    protected function pickWithPerTypeQuota(array $items, int $budget): array
    {
        if ($budget <= 0) return [];

        $byType = [];
        foreach ($items as $item) {
            $byType[(string) ($item['type'] ?? '')][] = $item;
        }

        $typeCount = count($byType);
        if ($typeCount === 0) return [];

        $minPerType = max(1, (int) floor($budget / ($typeCount * 2)));
        $minPerType = min($minPerType, 6);

        $selected = [];
        $selectedKeys = [];
        foreach ($byType as $type => $group) {
            foreach (array_slice($group, 0, $minPerType) as $item) {
                $key = $type . ':' . ($item['id'] ?? '');
                $selected[] = $item;
                $selectedKeys[$key] = true;
            }
        }

        if (count($selected) >= $budget) {
            usort($selected, fn ($a, $b) => $this->comparePresentedResults($a, $b));
            return array_slice($selected, 0, $budget);
        }

        $rest = array_values(array_filter($items, function ($item) use ($selectedKeys) {
            $key = ((string) ($item['type'] ?? '')) . ':' . ($item['id'] ?? '');
            return ! isset($selectedKeys[$key]);
        }));

        $needed = $budget - count($selected);
        $selected = array_merge($selected, array_slice($rest, 0, $needed));
        usort($selected, fn ($a, $b) => $this->comparePresentedResults($a, $b));
        return $selected;
    }

    /**
     * Товары в приоритете над остальными типами. Внутри группы — по релевантности.
     */
    protected function comparePresentedResults(array $a, array $b): int
    {
        $aProduct = (string) ($a['type'] ?? '') === 'product' ? 1 : 0;
        $bProduct = (string) ($b['type'] ?? '') === 'product' ? 1 : 0;
        if ($aProduct !== $bProduct) return $bProduct <=> $aProduct;

        $scoreA = (float) ($a['score'] ?? 0);
        $scoreB = (float) ($b['score'] ?? 0);
        $priority = (array) config('search.type_priority', []);
        $priorityA = (int) ($priority[(string) ($a['type'] ?? '')] ?? 0);
        $priorityB = (int) ($priority[(string) ($b['type'] ?? '')] ?? 0);

        $maxScore = max($scoreA, $scoreB, 1.0);
        $relativeGap = abs($scoreA - $scoreB) / $maxScore;
        if ($relativeGap <= 0.22 && $priorityA !== $priorityB) return $priorityB <=> $priorityA;

        $scoreCmp = $scoreB <=> $scoreA;
        if ($scoreCmp !== 0) return $scoreCmp;
        return $priorityB <=> $priorityA;
    }

    protected function groupPresentedByType(array $items): array
    {
        $groups = [];
        foreach ($items as $item) {
            $groups[$item['type']][] = $item;
        }
        return $groups;
    }

    /* ==================== Утилиты ==================== */

    /** Раскладка EN→RU (пользователь набрал rjn kf → котла). Первым идёт оригинал. */
    protected function queryVariants(string $q): array
    {
        $variants = [$q];
        if (preg_match('/[a-z`\[\];\',.]/i', $q) && ! preg_match('/\p{Cyrillic}/u', $q)) {
            $fixed = $this->fixKeyboardLayoutLatToCyr($q);
            if ($fixed !== '' && ! in_array($fixed, $variants, true)) $variants[] = $fixed;
        }
        return array_values(array_filter(array_unique($variants), fn ($v) => trim($v) !== ''));
    }

    protected function fixKeyboardLayoutLatToCyr(string $value): string
    {
        $map = [
            'q' => 'й', 'w' => 'ц', 'e' => 'у', 'r' => 'к', 't' => 'е', 'y' => 'н', 'u' => 'г', 'i' => 'ш', 'o' => 'щ', 'p' => 'з', '[' => 'х', ']' => 'ъ',
            'a' => 'ф', 's' => 'ы', 'd' => 'в', 'f' => 'а', 'g' => 'п', 'h' => 'р', 'j' => 'о', 'k' => 'л', 'l' => 'д', ';' => 'ж', "'" => 'э',
            'z' => 'я', 'x' => 'ч', 'c' => 'с', 'v' => 'м', 'b' => 'и', 'n' => 'т', 'm' => 'ь', ',' => 'б', '.' => 'ю', '`' => 'ё',
        ];
        $value = mb_strtolower($value, 'UTF-8');
        $out = '';
        $length = mb_strlen($value, 'UTF-8');
        for ($i = 0; $i < $length; $i++) {
            $char = mb_substr($value, $i, 1, 'UTF-8');
            $out .= $map[$char] ?? $char;
        }
        return trim(preg_replace('/\s+/u', ' ', $out));
    }

    protected function stripHtml(string $value): string
    {
        if ($value === '') return '';
        $value = preg_replace('#<(script|style)\b[^>]*>.*?</\1>#is', ' ', $value) ?? $value;
        $value = preg_replace('#<[^>]+>#', ' ', $value) ?? $value;
        $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $value = str_replace("\xC2\xA0", ' ', $value);
        return trim(preg_replace('/\s+/u', ' ', $value) ?? $value);
    }

    protected function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }

    protected function popularList(): array
    {
        return SearchQueryLog::where('locale', self::LOCALE)
            ->where(function ($q) {
                $q->where('results_count', '>', 0)->orWhereNotNull('clicked_type');
            })
            ->whereNotNull('normalized')->where('normalized', '!=', '')
            ->select('normalized', DB::raw('COUNT(*) as c'))
            ->groupBy('normalized')->orderByDesc('c')->limit(8)
            ->pluck('normalized')->all();
    }

    protected function logQuery(string $q, int $count, ?string $ip): void
    {
        SearchQueryLog::create([
            'query' => $q,
            'normalized' => Tokenizer::normalize($q),
            'locale' => self::LOCALE,
            'results_count' => $count,
            'ip' => $ip,
            'created_at' => now(),
        ]);
    }
}
