<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'title'       => (string) $this->title,
            'slug'        => (string) $this->slug,
            'description' => $this->description,
            'image'       => $this->image ? asset('assets/images/brands/' . $this->image) : null,
            'position'    => (int) $this->position,
        ];
    }
}
