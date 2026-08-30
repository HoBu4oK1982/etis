/**
 * Конфигурация API-клиента.
 *
 * NEXT_PUBLIC_API_URL — базовый URL Laravel API. В проекте принято
 * держать этот URL УЖЕ С СУФФИКСОМ /api/v1, чтобы path'ы, которые
 * передаются в apiFetch/apiGet, были короткими ("home", "search/suggest")
 * и одинаково работали в обоих клиентах (lib/api/client.ts и lib/api/server.ts).
 *
 *   Локально: http://localhost:8000/api/v1
 *   Прод:     https://etis.kz/api/v1
 *
 * Важно: не добавлять "/api/v1" ещё раз в этом файле — иначе получим
 * двойной префикс и 404 на всё.
 */

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://127.0.0.1:8000/api/v1";

/** Базовый URL Laravel API v1 без завершающего слеша. */
export const API_URL = RAW_API_URL.replace(/\/+$/, "");

/**
 * Алиас — оставлен для совместимости с уже написанным кодом
 * (SmartSearch, search-модули, home.ts и т.д. импортируют API_V1).
 * По значению совпадает с API_URL, потому что префикс v1 уже включён
 * в NEXT_PUBLIC_API_URL.
 */
export const API_V1 = API_URL;

/**
 * Ревалидация ISR для разных разделов.
 * Меняем в одном месте — применяется везде.
 */
export const REVALIDATE = {
  home: 300,        // 5 минут — главная
  catalog: 300,     // 5 минут — каталог/категории
  product: 600,     // 10 минут — карточка товара
  static: 3600,     // 1 час — статические разделы (about/delivery/contacts)
} as const;

/**
 * Теги для точечной ревалидации через revalidateTag().
 * Пригодится, когда бэк начнёт дёргать webhook на изменения.
 */
export const TAGS = {
  home: "home",
  categories: "categories",
  brands: "brands",
  products: "products",
  articles: "articles",
} as const;
