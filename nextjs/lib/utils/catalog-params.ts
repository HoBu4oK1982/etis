import {
  CATALOG_REMARKS,
  CATALOG_SORTS,
  DEFAULT_CATALOG_PARAMS,
  PER_PAGE_OPTIONS,
  type CatalogParams,
  type CatalogRemark,
  type CatalogSort,
  type CatalogView,
} from "../types/catalog";

/**
 * Единый парсер параметров каталога.
 *
 * Используется и на сервере (searchParams страницы /shop), и на клиенте
 * (useSearchParams в фильтрах) — благодаря этому SSR-разметка и клиентское
 * состояние всегда совпадают, без рассинхрона при гидрации.
 */

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function pick(raw: RawParams, key: string): string | undefined {
  if (raw instanceof URLSearchParams) {
    return raw.get(key) ?? undefined;
  }
  const v = raw[key];
  return Array.isArray(v) ? v[0] : v;
}

function toInt(value: string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function parseCatalogParams(raw: RawParams): CatalogParams {
  const sortRaw = pick(raw, "sort");
  const sort: CatalogSort = CATALOG_SORTS.some((s) => s.value === sortRaw)
    ? (sortRaw as CatalogSort)
    : "default";

  const remarkRaw = pick(raw, "remark");
  const remark = CATALOG_REMARKS.some((r) => r.value === remarkRaw)
    ? (remarkRaw as CatalogRemark)
    : undefined;

  const viewRaw = pick(raw, "view");
  const view: CatalogView = viewRaw === "compact" ? "compact" : "grid";

  const perPageRaw = toInt(pick(raw, "per_page"));
  const per_page = PER_PAGE_OPTIONS.includes(perPageRaw as (typeof PER_PAGE_OPTIONS)[number])
    ? (perPageRaw as number)
    : DEFAULT_CATALOG_PARAMS.per_page;

  const brands = (pick(raw, "brands") || "")
    .split(",")
    .map((v) => Number.parseInt(v.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  const priceFrom = toInt(pick(raw, "price_from"));
  const priceTo = toInt(pick(raw, "price_to"));

  const page = toInt(pick(raw, "page"));

  return {
    q: (pick(raw, "q") || "").trim() || undefined,
    category: (pick(raw, "category") || "").trim() || undefined,
    brands: Array.from(new Set(brands)),
    remark,
    price_from: priceFrom !== undefined && priceFrom >= 0 ? priceFrom : undefined,
    price_to: priceTo !== undefined && priceTo > 0 ? priceTo : undefined,
    sort,
    page: page && page > 1 ? page : 1,
    per_page,
    view,
  };
}

/**
 * Обратная операция: параметры → query-строка.
 * Дефолтные значения не пишем — URL остаётся чистым и шарабельным.
 */
export function buildCatalogQuery(params: CatalogParams): string {
  const sp = new URLSearchParams();

  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.brands.length) sp.set("brands", params.brands.join(","));
  if (params.remark) sp.set("remark", params.remark);
  if (params.price_from !== undefined) sp.set("price_from", String(params.price_from));
  if (params.price_to !== undefined) sp.set("price_to", String(params.price_to));
  if (params.sort !== "default") sp.set("sort", params.sort);
  if (params.per_page !== DEFAULT_CATALOG_PARAMS.per_page) sp.set("per_page", String(params.per_page));
  if (params.view !== "grid") sp.set("view", params.view);
  if (params.page > 1) sp.set("page", String(params.page));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/** Есть ли хоть один активный фильтр (сортировка/вид — не в счёт). */
export function hasActiveFilters(params: CatalogParams): boolean {
  return Boolean(
    params.q ||
      params.category ||
      params.brands.length ||
      params.remark ||
      params.price_from !== undefined ||
      params.price_to !== undefined
  );
}

/** Количество активных фильтров — для бейджа на мобильной кнопке. */
export function countActiveFilters(params: CatalogParams): number {
  let n = 0;
  if (params.category) n += 1;
  if (params.remark) n += 1;
  if (params.brands.length) n += params.brands.length;
  if (params.price_from !== undefined || params.price_to !== undefined) n += 1;
  if (params.q) n += 1;
  return n;
}
