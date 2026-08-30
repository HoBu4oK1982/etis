<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Product;

/**
 * Утилиты для работы с деревом категорий.
 *
 * Вынесено из контроллеров, чтобы одну и ту же логику
 * (поддерево ID, счётчики товаров) можно было переиспользовать
 * в CategoryController, ProductController и будущих разделах.
 */
final class CategoryTree
{
    /**
     * ID категории и всех её активных потомков до глубины $maxDepth.
     *
     * @return int[]
     */
    public static function descendantIds(int $categoryId, int $maxDepth = 5): array
    {
        $all   = [$categoryId];
        $level = [$categoryId];

        for ($d = 1; $d <= $maxDepth; $d++) {
            $children = Category::whereIn('parent_id', $level)
                ->where('status', 0)
                ->pluck('id')
                ->all();

            if (empty($children)) {
                break;
            }

            $all   = array_merge($all, $children);
            $level = $children;
        }

        return array_values(array_unique($all));
    }

    /**
     * Активная категория по slug (или null).
     */
    public static function findActiveBySlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)->where('status', 0)->first();
    }

    /**
     * Количество активных товаров в каждой категории с учётом всего поддерева.
     *
     * Делает ровно 2 запроса (категории + группировка товаров),
     * дальше сворачивает счётчики в памяти.
     *
     * @return array<int, int> [category_id => count]
     */
    public static function subtreeCounts(): array
    {
        $categories = Category::where('status', 0)
            ->get(['id', 'parent_id']);

        $own = Product::where('status', 0)
            ->whereNotNull('category_id')
            ->selectRaw('category_id, COUNT(*) as aggregate_count')
            ->groupBy('category_id')
            ->pluck('aggregate_count', 'category_id')
            ->all();

        $childrenMap = [];
        foreach ($categories as $c) {
            $childrenMap[$c->parent_id ?? 0][] = (int) $c->id;
        }

        $totals   = [];
        $visiting = [];

        $walk = function (int $id) use (&$walk, &$totals, &$visiting, $childrenMap, $own): int {
            if (isset($totals[$id])) {
                return $totals[$id];
            }

            // Страховка от битых данных (категория-предок сама себе потомок)
            if (isset($visiting[$id])) {
                return 0;
            }
            $visiting[$id] = true;

            $sum = (int) ($own[$id] ?? 0);

            foreach ($childrenMap[$id] ?? [] as $childId) {
                $sum += $walk($childId);
            }

            unset($visiting[$id]);

            return $totals[$id] = $sum;
        };

        foreach ($categories as $c) {
            $walk((int) $c->id);
        }

        return $totals;
    }
}
