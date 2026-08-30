<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'title',
        'slug',
        'sku',
        'price',
        'selling_price',
        'qty',
        'remark',
        'description',
        'short_description',
        'brand_id',
        'category_id',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'status',
        'new_until',
        'sale_from',
    ];

    protected $casts = [
        'new_until' => 'datetime',
        'sale_from' => 'datetime',
    ];

    /**
     * Товар в акции только пока новинка ещё не истекла.
     */
    public function getIsNewAttribute(): bool
    {
        if ($this->remark !== 'new') {
            return false;
        }

        if (empty($this->new_until)) {
            return false;
        }

        $until = $this->new_until instanceof \DateTimeInterface
            ? $this->new_until
            : Carbon::parse($this->new_until);

        return $until->isFuture();
    }

    public function scopeActualNew($query)
    {
        return $query
            ->where('remark', 'new')
            ->whereNotNull('new_until')
            ->where('new_until', '>=', now());
    }

    /**
     * category_id — стандартный FK (BIGINT → categories.id).
     * Использовать 'guid' как ключ было ошибкой: колонки guid в
     * миграции categories нет, поэтому eager-load валил 500.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class)->orderBy('position');
    }

    public function files()
    {
        return $this->hasMany(ProductFile::class)->orderBy('position');
    }
}
