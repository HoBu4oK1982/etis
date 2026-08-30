<?php

namespace App\Observers;

use App\Search\Index\DocumentIndexer;

/**
 * Поддерживает поисковый индекс в актуальном состоянии при изменении сущностей.
 * Карта модель → тип; регистрация — через SearchServiceProvider.
 */
class SearchableObserver
{
    public function __construct(protected DocumentIndexer $indexer) {}

    protected array $typeMap = [
        \App\Models\Product::class  => 'product',
        \App\Models\Category::class => 'category',
        \App\Models\Brand::class    => 'brand',
        \App\Models\Article::class  => 'article',
    ];

    public function saved($model): void
    {
        $type = $this->typeMap[get_class($model)] ?? null;
        if ($type) {
            $this->indexer->indexOne($type, $model);
        }
    }

    public function deleted($model): void
    {
        $this->indexer->removeFor(get_class($model), $model->id);
    }
}
