<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\NextRevalidator;

/**
 * При любом изменении товара (создание, обновление, восстановление,
 * удаление) шлём во фронт список связанных тегов ISR для ревалидации.
 * Отдельный observer от SearchableObserver — у них разные ответственности,
 * а точки во времени срабатывания те же.
 */
class ProductRevalidateObserver
{
    public function saved(Product $product): void
    {
        NextRevalidator::forProduct($product);
    }

    public function deleted(Product $product): void
    {
        NextRevalidator::forProduct($product);
    }

    public function restored(Product $product): void
    {
        NextRevalidator::forProduct($product);
    }
}
