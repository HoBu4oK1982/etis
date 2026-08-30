<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'title'             => (string) $this->title,
            'subtitle'          => $this->subtitle,
            'short_description' => $this->short_description,
            'slug'              => (string) $this->slug,
            'description'       => $this->description,
            'image'             => $this->image ? asset('assets/images/categories/' . $this->image) : null,
            'parent_id'         => $this->parent_id,
            'position'          => (int) $this->position,

            'meta' => [
                'title'       => $this->meta_title ?: $this->title,
                'description' => $this->meta_description,
                'keywords'    => $this->meta_keywords,
            ],
        ];
    }
}
