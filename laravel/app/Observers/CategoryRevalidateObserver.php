<?php

namespace App\Observers;

use App\Models\Category;
use App\Services\NextRevalidator;

class CategoryRevalidateObserver
{
    public function saved(Category $category): void
    {
        NextRevalidator::forCategory($category);
    }

    public function deleted(Category $category): void
    {
        NextRevalidator::forCategory($category);
    }

    public function restored(Category $category): void
    {
        NextRevalidator::forCategory($category);
    }
}
