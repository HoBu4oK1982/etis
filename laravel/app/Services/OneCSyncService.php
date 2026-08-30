<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Синхронизация с 1С.
 *
 * КРИТИЧЕСКОЕ ОТЛИЧИЕ от старой логики в AdminUpdateComponent:
 * если 1С не ответил или вернул пустоту — просто выходим,
 * НЕ делаем mark-and-sweep. Иначе одна проблема с сетью в 3 ночи
 * скроет весь каталог с сайта.
 */
class OneCSyncService
{
    protected const CREDS_USER = 'PandaBox';
    protected const CREDS_PASS = 'P@ndaPass123';
    protected const BASE_URL   = 'http://t-ts.dyndns.org:30080/PNB/hs/website';
    protected const TIMEOUT    = 60; // сек

    /** Категории с такими именами игнорируем */
    protected const IGNORED_CATEGORY_NAMES = [
        'Рабочий процесс', 'РАСПРОДАЖА', 'удаление',
        'НОМЕНКЛАТУРА', 'пусто', 'Апусто',
    ];

    /** Товары с такими именами игнорируем */
    protected const IGNORED_PRODUCT_NAMES = [
        'Рабочий процесс', 'удаление',
        'НОМЕНКЛАТУРА', 'пусто', 'Апусто',
    ];

    /** Категории, у которых нельзя менять parent_id (правило старой логики) */
    protected const LOCKED_PARENT_GUIDS = [
        'aba878af-8f8c-11ef-818a-001133559908',
        'aba878b0-8f8c-11ef-818a-001133559908',
        'aba878b1-8f8c-11ef-818a-001133559908',
        'aba878b3-8f8c-11ef-818a-001133559908',
        '6ea89add-e30e-11ee-9dcf-00090ffe0001',
    ];

    /**
     * @return array{fetched:int, saved:int, hidden:int, shown:int, skipped:int, error:?string}
     */
    public function syncCategories(): array
    {
        $stats = [
            'fetched' => 0, 'saved' => 0, 'hidden' => 0,
            'shown' => 0, 'skipped' => 0, 'error' => null,
        ];

        try {
            $response = Http::accept('application/json')
                ->withBasicAuth(self::CREDS_USER, self::CREDS_PASS)
                ->timeout(self::TIMEOUT)
                ->get(self::BASE_URL . '/categories');

            if (! $response->successful()) {
                throw new \RuntimeException("1С вернул HTTP {$response->status()}");
            }

            $json = $response->json();

            if (! is_array($json) || empty($json)) {
                throw new \RuntimeException('1С вернул пустой или невалидный JSON');
            }
        } catch (Throwable $e) {
            $stats['error'] = $e->getMessage();
            Log::warning('[1C] Categories sync failed: ' . $e->getMessage());
            return $stats;
        }

        $stats['fetched'] = count($json);
        $arrivedGuids = [];

        foreach ($json as $data) {
            try {
                if (! isset($data['Name'], $data['GUID'])) {
                    $stats['skipped']++;
                    continue;
                }

                if (in_array($data['Name'], self::IGNORED_CATEGORY_NAMES, true)) {
                    $stats['skipped']++;
                    continue;
                }

                $arrivedGuids[] = $data['GUID'];

                $slug = Str::slug($data['Name'], '-');
                $title = str_replace('&nbsp;', ' ', htmlentities($data['Name']));

                $category = Category::where('guid', $data['GUID'])->first();

                if ($category) {
                    $category->title = $title;
                    $category->slug = $slug;
                    if (! in_array($data['GUID'], self::LOCKED_PARENT_GUIDS, true)) {
                        $category->parent_id = $data['ParentGUID'] ?? null;
                    }
                    $category->save();
                } else {
                    Category::create([
                        'title'     => $title,
                        'slug'      => $slug,
                        'parent_id' => $data['ParentGUID'] ?? null,
                        'guid'      => $data['GUID'],
                        'status'    => 0,
                    ]);
                }

                $stats['saved']++;
            } catch (Throwable $e) {
                // одна плохая строка не должна ронять весь синк
                $stats['skipped']++;
                Log::warning("[1C] Category {$data['GUID']} skipped: " . $e->getMessage());
            }
        }

        // MARK-AND-SWEEP — только если действительно получили список
        if (! empty($arrivedGuids)) {
            $stats['hidden'] = Category::whereNotIn('guid', $arrivedGuids)
                ->where('status', 0)
                ->update(['status' => 1]);

            $stats['shown'] = Category::whereIn('guid', $arrivedGuids)
                ->where('status', 1)
                ->update(['status' => 0]);
        }

        Log::info('[1C] Categories synced', $stats);
        return $stats;
    }

    /**
     * @return array{fetched:int, saved:int, hidden:int, shown:int, skipped:int, error:?string}
     */
    public function syncProducts(): array
    {
        $stats = [
            'fetched' => 0, 'saved' => 0, 'hidden' => 0,
            'shown' => 0, 'skipped' => 0, 'merged' => 0, 'error' => null,
        ];

        try {
            $response = Http::accept('application/json')
                ->withBasicAuth(self::CREDS_USER, self::CREDS_PASS)
                ->timeout(self::TIMEOUT)
                ->get(self::BASE_URL . '/products');

            if (! $response->successful()) {
                throw new \RuntimeException("1С вернул HTTP {$response->status()}");
            }

            $json = $response->json();

            if (! is_array($json) || empty($json)) {
                throw new \RuntimeException('1С вернул пустой или невалидный JSON');
            }
        } catch (Throwable $e) {
            $stats['error'] = $e->getMessage();
            Log::warning('[1C] Products sync failed: ' . $e->getMessage());
            return $stats;
        }

        $stats['fetched'] = count($json);
        $arrivedGuids = [];

        // ─── Агрегация дублей: один GUID может прийти несколько раз ───
        // (разные склады — Алматы, Астана). Суммируем Stock,
        // остальные поля берём из первого вхождения (или из того, где есть данные).
        $merged = [];
        foreach ($json as $data) {
            if (! isset($data['Name'], $data['GUID'])) {
                $stats['skipped']++;
                continue;
            }

            if (in_array($data['Name'], self::IGNORED_PRODUCT_NAMES, true)) {
                $stats['skipped']++;
                continue;
            }

            $guid = $data['GUID'];

            if (isset($merged[$guid])) {
                // Суммируем остаток
                $merged[$guid]['Stock'] = ((int) ($merged[$guid]['Stock'] ?? 0))
                                        + ((int) ($data['Stock'] ?? 0));

                // Если у первого вхождения не было цены/описания — берём из текущего
                if (empty($merged[$guid]['Price']) && ! empty($data['Price'])) {
                    $merged[$guid]['Price'] = $data['Price'];
                }
                if (empty($merged[$guid]['Description']) && ! empty($data['Description'])) {
                    $merged[$guid]['Description'] = $data['Description'];
                }
            } else {
                $merged[$guid] = $data;
            }
        }

        $stats['merged'] = $stats['fetched'] - count($merged) - $stats['skipped'];
        Log::info("[1C] Products pre-aggregation: {$stats['fetched']} raw rows → " . count($merged) . " unique GUIDs ({$stats['merged']} duplicates merged)");

        foreach ($merged as $data) {
            try {
                $arrivedGuids[] = $data['GUID'];

                $stock = (int) ($data['Stock'] ?? 0);
                $inStock = $stock > 0;
                $slug = Str::slug($data['Name'], '-') . '_' . mb_substr($data['GUID'], 0, 8);
                $title = str_replace('&nbsp;', ' ', htmlentities($data['Name']));

                $product = Product::where('guid', $data['GUID'])->first();

                if ($product) {
                    $product->title = $title;
                    $product->slug = $slug;
                    $product->description = $data['Description'] ?? '';
                    $product->category_id = $data['ParentGUID'] ?? $product->category_id;
                    $product->qty = $inStock ? $stock : 0;
                    $product->status = $inStock ? 0 : 1;
                    $product->price = $data['Price'] ?? $product->price;
                    $product->save();
                } else {
                    Product::create([
                        'title'       => $title,
                        'slug'        => $slug,
                        'description' => $data['Description'] ?? '',
                        'category_id' => $data['ParentGUID'] ?? '',
                        'qty'         => $inStock ? $stock : 0,
                        'status'      => $inStock ? 0 : 1,
                        'price'       => $data['Price'] ?? 0,
                        'guid'        => $data['GUID'],
                    ]);
                }

                $stats['saved']++;
            } catch (Throwable $e) {
                $stats['skipped']++;
                Log::warning("[1C] Product {$data['GUID']} skipped: " . $e->getMessage());
            }
        }

        // MARK-AND-SWEEP для товаров:
        // те, которых нет в выгрузке — скрываем
        if (! empty($arrivedGuids)) {
            $stats['hidden'] = Product::whereNotIn('guid', $arrivedGuids)
                ->where('status', 0)
                ->update(['status' => 1, 'qty' => 0]);

            // те, что пришли — уже обработаны в цикле выше (status=0/1 по остатку)
        }

        Log::info('[1C] Products synced', $stats);
        return $stats;
    }
}
