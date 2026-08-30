<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Лёгкий ресурс для карточек товара в каталоге/поиске/related.
 * Не тянет описания и характеристики.
 */
class ProductListResource extends JsonResource
{
    public function toArray($request): array
    {
        $price         = $this->price !== null ? (float) $this->price : null;
        $sellingPrice  = $this->selling_price !== null ? (float) $this->selling_price : null;

        // "Эффективная" цена = selling_price ?? price (используется на фронте)
        $effective     = $sellingPrice !== null && $sellingPrice > 0 ? $sellingPrice : $price;
        $hasDiscount   = $sellingPrice !== null && $price !== null && $sellingPrice > 0 && $sellingPrice < $price;

        // Первая картинка для превью
        $firstImage = $this->whenLoaded('images', function () {
            $img = $this->images->first();
            return $img ? asset('assets/images/products/' . $img->file_name) : null;
        });

        return [
            'id'             => $this->id,
            'title'          => (string) $this->title,
            'slug'           => (string) $this->slug,
            'sku'            => $this->sku,
            'price'          => $price,
            'selling_price'  => $sellingPrice,
            'effective_price'=> $effective,
            'has_discount'   => $hasDiscount,
            'remark'         => $this->remark, // hit|sale|new|null
            'thumbnail'      => $firstImage,
            'brand'          => $this->whenLoaded('brand', fn() => $this->brand ? [
                'id'    => $this->brand->id,
                'title' => $this->brand->title,
                'slug'  => $this->brand->slug,
                // Логотип нужен карточке в каталоге: показываем его
                // вместо названия, если файл залит
                'image' => $this->brand->image
                    ? asset('assets/images/brands/' . $this->brand->image)
                    : null,
            ] : null),
            'category_id'    => $this->category_id,
        ];
    }
}
