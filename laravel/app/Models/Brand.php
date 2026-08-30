<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'image',
        'position',
        'status',
    ];

    protected $casts = [
        'position' => 'integer',
        'status' => 'integer',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'brand_id');
    }

    public static function makeUniqueSlugFromTitle(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 2;

        $q = static::query()->where('slug', $slug);
        if ($ignoreId) {
            $q->where('id', '!=', $ignoreId);
        }

        while ($q->exists()) {
            $slug = $base . '-' . $i;
            $i++;

            $q = static::query()->where('slug', $slug);
            if ($ignoreId) {
                $q->where('id', '!=', $ignoreId);
            }
        }

        return $slug;
    }
}
