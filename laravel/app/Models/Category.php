<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'short_description',
        'slug',
        'description',
        'image',
        'parent_id',
        'position',
        'status',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'position' => 'integer',
        'status' => 'integer',
    ];

    /**
     * Scope: только активные (status = 0).
     */
    public function scopeActive($query)
    {
        return $query->where('status', 0);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('position')->orderBy('id');
    }

    /**
     * Только активные дочерние категории (для фронта).
     */
    public function activeChildren(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->where('status', 0)->orderBy('position')->orderBy('id');
    }

    /**
     * Генерирует уникальный slug.
     * Если slug уже существует — добавляет бренд (категория на 3-м уровне от корня) через "-" (пример: gorelki-baltur),
     * если и так занято — добавляет суффикс "-2", "-3", ...
     */
    public static function makeUniqueSlugFromTitle(string $title, ?int $parentId = null, ?int $ignoreId = null): string
    {
        $base = Str::slug($title, '-');
        if ($base === '') {
            $base = 'category';
        }

        if (!static::slugExists($base, $ignoreId)) {
            return $base;
        }

        $brandSlug = static::getBrandSlugByParentId($parentId);

        if (!empty($brandSlug)) {
            $candidate = $base . '-' . $brandSlug;

            if (!static::slugExists($candidate, $ignoreId)) {
                return $candidate;
            }

            $i = 2;
            while (static::slugExists($candidate . '-' . $i, $ignoreId)) {
                $i++;
            }
            return $candidate . '-' . $i;
        }

        $i = 2;
        while (static::slugExists($base . '-' . $i, $ignoreId)) {
            $i++;
        }
        return $base . '-' . $i;
    }

    private static function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        $q = static::query()->where('slug', $slug);
        if (!empty($ignoreId)) {
            $q->where('id', '!=', $ignoreId);
        }
        return $q->exists();
    }

    /**
     * Возвращает slug бренда (категория 3-го уровня от корня) по parent_id текущей категории.
     * Пример цепочки: Отопление(1) -> Горелки(2) -> Baltur(3) -> ... => brandSlug = "baltur"
     */
    private static function getBrandSlugByParentId(?int $parentId): ?string
    {
        if (empty($parentId)) {
            return null;
        }

        $chain = [];
        $currentId = $parentId;

        // Собираем цепочку родителей: root -> ... -> parent
        while (!empty($currentId)) {
            $node = static::query()
                ->select(['id', 'parent_id', 'slug'])
                ->find($currentId);

            if (!$node) {
                break;
            }

            array_unshift($chain, $node);
            $currentId = $node->parent_id;
        }

        // brand = 3-й уровень (index 2)
        if (count($chain) >= 3) {
            return (string) $chain[2]->slug;
        }

        return null;
    }

}
