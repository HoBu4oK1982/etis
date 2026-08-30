<?php

namespace App\Observers;

use App\Models\Slider;
use App\Services\NextRevalidator;

class SliderRevalidateObserver
{
    public function saved(Slider $slider): void
    {
        NextRevalidator::forSlider();
    }

    public function deleted(Slider $slider): void
    {
        NextRevalidator::forSlider();
    }

    public function restored(Slider $slider): void
    {
        NextRevalidator::forSlider();
    }
}
