<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductAttributeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'       => $this->id,
            'name'     => (string) $this->name,
            'value'    => (string) $this->value,
            'position' => (int) $this->position,
        ];
    }
}
