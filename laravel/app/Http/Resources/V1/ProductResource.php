<?php

namespace App\Http\Resources\V1;

use App\Support\Html;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Полный ресурс товара для страницы деталей.
 */
class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        $price        = $this->price !== null ? (float) $this->price : null;
        $sellingPrice = $this->selling_price !== null ? (float) $this->selling_price : null;
        $effective    = $sellingPrice !== null && $sellingPrice > 0 ? $sellingPrice : $price;
        $hasDiscount  = $sellingPrice !== null && $price !== null && $sellingPrice > 0 && $sellingPrice < $price;
        $discountPct  = $hasDiscount ? (int) round(100 - ($sellingPrice / $price * 100)) : null;

        return [
            'id'                => $this->id,
            'title'             => (string) $this->title,
            'slug'              => (string) $this->slug,
            'sku'               => $this->sku,
            'price'             => $price,
            'selling_price'     => $sellingPrice,
            'effective_price'   => $effective,
            'has_discount'      => $hasDiscount,
            'discount_percent'  => $discountPct,
            // Короткое описание фронт печатает как обычный текст —
            // отдаём его без разметки. Полное описание выводится через
            // dangerouslySetInnerHTML, поэтому там разметку сохраняем,
            // снимая только документную обёртку и скрипты.
            'short_description' => Html::toText($this->short_description),
            'description'       => Html::clean($this->description),
            'remark'            => $this->remark,
            'status'            => (int) $this->status,

            'images'     => ProductImageResource::collection($this->whenLoaded('images')),
            'attributes' => ProductAttributeResource::collection($this->whenLoaded('attributes')),

            'brand' => $this->whenLoaded('brand', fn() => $this->brand
                ? new BrandResource($this->brand)
                : null),

            'category' => $this->whenLoaded('category', fn() => $this->category ? [
                'id'    => $this->category->id,
                'title' => $this->category->title,
                'slug'  => $this->category->slug,
            ] : null),

            // SEO
            'meta' => [
                'title'       => $this->meta_title ?: $this->title,
                'description' => $this->meta_description ?: Html::toText($this->short_description),
                'keywords'    => $this->meta_keywords,
            ],

            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
