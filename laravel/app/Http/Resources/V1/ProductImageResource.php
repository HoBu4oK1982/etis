<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    public function toArray($request): array
    {
        // Картинки лежат в public/assets/images/products/
        $path = 'assets/images/products/' . $this->file_name;

        return [
            'id'       => $this->id,
            'position' => (int) $this->position,
            'url'      => asset($path),
            'path'     => $path,
        ];
    }
}
