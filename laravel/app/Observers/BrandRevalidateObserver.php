<?php

namespace App\Observers;

use App\Models\Brand;
use App\Services\NextRevalidator;

class BrandRevalidateObserver
{
    public function saved(Brand $brand): void
    {
        NextRevalidator::forBrand($brand);
    }

    public function deleted(Brand $brand): void
    {
        NextRevalidator::forBrand($brand);
    }

    public function restored(Brand $brand): void
    {
        NextRevalidator::forBrand($brand);
    }
}
