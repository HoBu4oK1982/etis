<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Клиент точечной инвалидации ISR-кэша во фронте (Next.js).
 *
 * Собирает набор тегов и одним HTTP-запросом отправляет их в
 * POST /api/revalidate на фронте. Секрет — из config('services.next').
 *
 * Дизайн:
 *   - Никаких пробросов исключений наружу. Админка не должна падать,
 *     если фронт временно недоступен: логируем warning и идём дальше.
 *   - Пустая конфигурация — тихий no-op. Позволяет катить фичу
 *     поэтапно (сначала налить env, потом наблюдать).
 *   - Синхронный send() с коротким timeout. Очередей в проекте нет,
 *     а 1–3 секунды на webhook при сохранении в админке — терпимо.
 *     Если появится queue worker — переносим отправку в job.
 *
 * Использование:
 *   NextRevalidator::forProduct($product);
 *   NextRevalidator::forBrand($brand);
 *   (new NextRevalidator())->tags(['home','catalog'])->send();
 */
class NextRevalidator
{
    /** @var array<int, string> */
    private array $tags = [];

    /** @var array<int, string> */
    private array $paths = [];

    /**
     * @param string|array<int,string> $tags
     */
    public function tags(string|array $tags): self
    {
        foreach ((array) $tags as $tag) {
            $tag = trim((string) $tag);
            if ($tag !== '') {
                $this->tags[] = $tag;
            }
        }

        return $this;
    }

    /**
     * @param string|array<int,string> $paths
     */
    public function paths(string|array $paths): self
    {
        foreach ((array) $paths as $path) {
            $path = trim((string) $path);
            if ($path !== '' && str_starts_with($path, '/')) {
                $this->paths[] = $path;
            }
        }

        return $this;
    }

    /**
     * Отправить накопленный список во фронт.
     * Ничего не возвращает и не бросает — работает как «выстрелил и забыл».
     */
    public function send(): void
    {
        $tags = array_values(array_unique($this->tags));
        $paths = array_values(array_unique($this->paths));

        if ($tags === [] && $paths === []) {
            return;
        }

        $url = config('services.next.revalidate_url');
        $secret = config('services.next.revalidate_secret');
        $timeout = (int) (config('services.next.revalidate_timeout') ?: 3);

        if (!$url || !$secret) {
            // Не сконфигурировано — фича выключена
            return;
        }

        try {
            Http::timeout($timeout)
                ->connectTimeout(min($timeout, 2))
                ->acceptJson()
                ->withHeaders([
                    'X-Revalidate-Secret' => $secret,
                    'User-Agent'          => 'ETIS-Laravel-Revalidator/1.0',
                ])
                ->post($url, [
                    'tags'  => $tags,
                    'paths' => $paths,
                ]);
        } catch (\Throwable $e) {
            Log::warning('NextRevalidator: ' . $e->getMessage(), [
                'tags'  => $tags,
                'paths' => $paths,
            ]);
        }
    }

    /* ============================================================
       Готовые наборы для каждой сущности
       ============================================================ */

    /**
     * Товар: все списки товаров + карточка + разделы, где он лежит,
     * + бренд (счётчики), + главная (hits/sales/news).
     */
    public static function forProduct(Product $product): void
    {
        $revalidator = new self();

        $revalidator->tags([
            'products',
            'catalog',
            'home',
            'categories',       // счётчики products_count в CategoryTile
            'categories:top',
            'brands',           // счётчики products_count у брендов
        ]);

        if ($product->slug) {
            $revalidator->tags('product:' . $product->slug);
        }

        // Все категории по цепочке вверх — карточка товара влияет на
        // весь путь (счётчики поддерева, «свежие» списки на разделах)
        $category = $product->category;
        $guard = 0;
        while ($category && $guard++ < 10) {
            if ($category->slug) {
                $revalidator->tags([
                    'category:' . $category->slug,
                    'category:' . $category->slug . ':products',
                ]);
            }
            $category = $category->parent;
        }

        // Бренд, если у товара он есть
        if ($product->brand) {
            $revalidator->tags([
                'brand:' . $product->brand->slug,
                'brand:' . $product->brand->slug . ':products',
            ]);
        }

        $revalidator->send();
    }

    /**
     * Категория: списки категорий + сама категория + главная + каталог.
     * Родителей тоже трогаем — счётчики поддерева меняются.
     */
    public static function forCategory(Category $category): void
    {
        $revalidator = new self();

        $revalidator->tags([
            'categories',
            'categories:top',
            'tree',
            'home',
            'catalog',
        ]);

        // Цепочка предков — счётчики products_count и path breadcrumbs
        $node = $category;
        $guard = 0;
        while ($node && $guard++ < 10) {
            if ($node->slug) {
                $revalidator->tags([
                    'category:' . $node->slug,
                    'category:' . $node->slug . ':products',
                ]);
            }
            $node = $node->parent;
        }

        $revalidator->send();
    }

    /**
     * Бренд: списки брендов + сам бренд + партнёры на главной.
     * Товары трогаем целиком — на страницах товаров могут быть
     * лого/название бренда, которые тоже обновятся.
     */
    public static function forBrand(Brand $brand): void
    {
        $revalidator = (new self())->tags([
            'brands',
            'home',
            'catalog',
            'products',
        ]);

        if ($brand->slug) {
            $revalidator->tags([
                'brand:' . $brand->slug,
                'brand:' . $brand->slug . ':products',
            ]);
        }

        $revalidator->send();
    }

    /**
     * Статья: списки статей + сама статья + главная (последние 3).
     */
    public static function forArticle(Article $article): void
    {
        $revalidator = (new self())->tags(['articles', 'home']);

        if ($article->slug) {
            $revalidator->tags('article:' . $article->slug);
        }

        $revalidator->send();
    }

    /**
     * Слайдер: только главная.
     */
    public static function forSlider(): void
    {
        (new self())->tags('home')->send();
    }
}
