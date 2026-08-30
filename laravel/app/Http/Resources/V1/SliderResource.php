<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class SliderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'       => $this->id,
            'eyebrow'  => $this->eyebrow ?? null,
            'title'    => $this->title ?? null,
            'subtitle' => $this->subtitle ?? null,
            'link'     => $this->link ?? null,
            'image'    => $this->image ? asset('assets/images/sliders/' . $this->image) : null,
            'position' => (int) ($this->position ?? 0),
        ];
    }
}
