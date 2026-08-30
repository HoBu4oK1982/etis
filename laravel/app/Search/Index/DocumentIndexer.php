<?php

namespace App\Search\Index;

use Illuminate\Support\Facades\DB;
use App\Models\SearchDocument;
use App\Models\SearchTerm;
use App\Search\Document;
use App\Search\Linguistics\Tokenizer;
use App\Search\Linguistics\Transliterator;

use App\Models\Product;
use App\Models\Category;
use App\Models\Article;
use App\Models\Brand;

/**
 * Строит поисковый индекс (search_documents + search_terms) для etis.kz.
 * Индексируется 4 типа сущностей: product, category, brand, article.
 * Запускается командой `php artisan search:reindex` и из observers при save/delete.
 */
class DocumentIndexer
{
    /** У etis.kz только русская локаль. Оставлено массивом для совместимости с движком. */
    protected array $locales;

    public function __construct()
    {
        $this->locales = (array) config('search.locales', ['ru']);
    }

    /** Полная переиндексация. Возвращает кол-во документов. */
    public function reindexAll(?callable $progress = null): int
    {
        SearchTerm::query()->delete();

        $count = 0;
        foreach ($this->sources() as $type => [$class, $extractor]) {
            $class::query()->chunk(200, function ($rows) use (&$count, $type, $extractor, $progress) {
                foreach ($rows as $row) {
                    $count += $this->indexModel($type, $row, $extractor);
                    if ($progress) $progress($type, $count);
                }
            });
        }

        $this->pruneOrphans();

        return $count;
    }

    /** Переиндексировать одну запись (для observers). */
    public function indexOne(string $type, $model): void
    {
        $extractor = $this->sources()[$type][1] ?? null;
        if ($extractor) {
            $this->indexModel($type, $model, $extractor);
        }
    }

    public function removeFor(string $modelClass, $id): void
    {
        SearchDocument::where('searchable_type', $modelClass)
            ->where('searchable_id', $id)->delete();
    }

    /* --------------------------------------------------------------------- */

    protected function indexModel(string $type, $model, callable $extractor): int
    {
        $written = 0;

        foreach ($this->locales as $locale) {
            $data = $extractor($model, $locale);
            if (empty($data['title'])) {
                continue;
            }

            $built = Document::build($data['title'], $data['keywords'] ?? '', $data['body'] ?? '');

            SearchDocument::updateOrCreate(
                [
                    'searchable_type' => get_class($model),
                    'searchable_id' => $model->id,
                    'locale' => $locale,
                ],
                array_merge($built, [
                    'type' => $type,
                    'title' => $data['title'],
                    'url' => $data['url'] ?? null,
                    'image' => $data['image'] ?? null,
                    'price' => $data['price'] ?? null,
                    'currency' => $data['currency'] ?? null,
                    'in_stock' => $data['in_stock'] ?? false,
                    'popularity' => $data['popularity'] ?? 0,
                    'weight' => config('search.type_weights')[$type] ?? 1.0,
                ])
            );

            $this->indexTerms($data['title'] . ' ' . ($data['keywords'] ?? ''), $locale);
            $written++;
        }

        return $written;
    }

    /** Накопление словаря терминов (поверхностные слова заголовков/ключевиков). */
    protected function indexTerms(string $text, string $locale): void
    {
        $words = preg_split('/[\s\-]+/u', Tokenizer::normalize($text), -1, PREG_SPLIT_NO_EMPTY);
        foreach (array_unique($words) as $w) {
            if (mb_strlen($w, 'UTF-8') < 3) continue;
            SearchTerm::query()->updateOrInsert(
                ['term' => $w, 'locale' => $locale],
                ['translit' => Transliterator::toLatin($w), 'df' => DB::raw('df + 1'), 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    protected function pruneOrphans(): void
    {
        foreach ($this->sources() as $type => [$class]) {
            $ids = $class::query()->pluck('id');
            SearchDocument::where('searchable_type', $class)
                ->whereNotIn('searchable_id', $ids)->delete();
        }
    }

    /* ---------------- Реестр сущностей etis.kz --------------------------- */

    protected function sources(): array
    {
        return [
            'product' => [Product::class, function ($m, $l) {
                $brandTitle    = optional($m->brand)->title;
                $categoryTitle = optional($m->category)->title;
                $firstImage    = optional($m->images->first())->file_name ?? null;

                return [
                    'title'    => (string) $m->title,
                    // keywords — короткий коммерческий индекс: meta_keywords + SKU + бренд + категория
                    'keywords' => trim(implode(' ', array_filter([
                        $m->meta_keywords,
                        $m->sku,
                        $brandTitle,
                        $categoryTitle,
                    ]))),
                    // body — длинный контентный индекс: описания + мета
                    'body' => trim(implode(' ', array_filter([
                        $m->short_description,
                        $m->description,
                        $m->meta_description,
                    ]))),
                    'url'        => '/product/' . $m->slug,
                    'image'      => $firstImage ? $this->asset('assets/images/products/' . $firstImage) : null,
                    'price'      => $m->selling_price ?: $m->price,
                    'currency'   => 'KZT',
                    'in_stock'   => ((int) ($m->status ?? 0)) === 0,
                    // популярность: hit > new/sale > обычный
                    'popularity' => $this->productPopularity($m),
                ];
            }],

            'category' => [Category::class, function ($m, $l) {
                return [
                    'title'    => (string) $m->title,
                    'keywords' => (string) ($m->meta_keywords ?? ''),
                    'body' => trim(implode(' ', array_filter([
                        $m->description,
                        $m->meta_description,
                    ]))),
                    'url'        => '/category/' . $m->slug,
                    'image'      => $m->image ? $this->asset('assets/images/categories/' . $m->image) : null,
                    'popularity' => 0.6,
                    'in_stock'   => true,
                ];
            }],

            'brand' => [Brand::class, function ($m, $l) {
                return [
                    'title'    => (string) $m->title,
                    'keywords' => (string) $m->title,
                    'body'     => (string) ($m->description ?? ''),
                    'url'        => '/brands/' . $m->slug,
                    'image'      => $m->image ? $this->asset('assets/images/brands/' . $m->image) : null,
                    'popularity' => 0.5,
                    'in_stock'   => true,
                ];
            }],

            'article' => [Article::class, function ($m, $l) {
                return [
                    'title'    => (string) $m->title,
                    'keywords' => (string) ($m->meta_keywords ?? ''),
                    'body' => trim(implode(' ', array_filter([
                        $m->short_description,
                        $m->description,
                        $m->meta_description,
                    ]))),
                    'url'        => '/article/' . $m->slug,
                    'image'      => $m->image ? $this->asset('assets/images/articles/' . $m->image) : null,
                    'popularity' => 0.35,
                    'in_stock'   => true,
                ];
            }],
        ];
    }

    /** Популярность товара с учётом remark. */
    protected function productPopularity($m): float
    {
        return match ((string) ($m->remark ?? '')) {
            'hit'  => 0.85,
            'new'  => 0.55,
            'sale' => 0.5,
            default => 0.3,
        };
    }

    /** Абсолютный URL через asset() — совпадает с ProductListResource и другими Resources. */
    protected function asset(string $path): string
    {
        return asset(ltrim($path, '/'));
    }
}
