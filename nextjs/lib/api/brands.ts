import { apiGet } from "./server";
import { REVALIDATE, TAGS } from "./config";
import type { ApiSingle } from "../types/api";
import type {
  BrandDetail,
  BrandProductsResponse,
  BrandsResponse,
} from "../types/brand";
import type { CatalogParams } from "../types/catalog";

/**
 * Слой API для раздела «Бренды».
 *
 * Отдельный модуль от lib/api/catalog.ts: там brands-хелперы остались
 * для старых вызовов (без счётчиков и facets), здесь — расширенный
 * контракт под страницы /brands и /brands/{slug}.
 */

/** GET /api/v1/brands — все активные бренды со счётчиками товаров. */
export async function getBrands(): Promise<BrandsResponse> {
  return apiGet<BrandsResponse>("brands", {
    revalidate: REVALIDATE.catalog,
    tags: [TAGS.brands],
  });
}

/** GET /api/v1/brands/{slug} */
export async function getBrandDetail(slug: string): Promise<BrandDetail> {
  const res = await apiGet<ApiSingle<BrandDetail>>(`brands/${slug}`, {
    revalidate: REVALIDATE.catalog,
    tags: [TAGS.brands, `brand:${slug}`],
  });
  return res.data;
}

/**
 * GET /api/v1/brands/{slug}/products — товары бренда с фильтрами и facets.
 * Пустые/дефолтные значения не отправляем: короче URL — выше попадание в кэш.
 */
export async function getBrandProducts(
  slug: string,
  params: Partial<CatalogParams> = {}
): Promise<BrandProductsResponse> {
  return apiGet<BrandProductsResponse>(`brands/${slug}/products`, {
    params: {
      q: params.q || undefined,
      category: params.category || undefined,
      remark: params.remark || undefined,
      price_from: params.price_from ?? undefined,
      price_to: params.price_to ?? undefined,
      sort: params.sort && params.sort !== "default" ? params.sort : undefined,
      page: params.page && params.page > 1 ? params.page : undefined,
      per_page: params.per_page ?? undefined,
    },
    revalidate: REVALIDATE.catalog,
    tags: [TAGS.products, `brand:${slug}:products`],
  });
}

/** Пустой ответ списка брендов — фолбэк при недоступном API. */
export const EMPTY_BRANDS_RESPONSE: BrandsResponse = {
  data: [],
  meta: { total: 0, products_total: 0, with_products: 0 },
};
