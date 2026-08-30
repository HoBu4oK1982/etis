import { apiGet } from "./server";
import type { ApiCollection } from "../types/api";
import type {
  CatalogParams,
  CategoryTile,
  ShopProductsResponse,
} from "../types/catalog";
import { REVALIDATE, TAGS } from "./config";

/**
 * GET /api/v1/categories/top
 * Категории верхнего уровня с картинками, счётчиками и вторым уровнем.
 */
export async function getTopCategories(): Promise<CategoryTile[]> {
  const res = await apiGet<ApiCollection<CategoryTile>>("categories/top", {
    revalidate: REVALIDATE.catalog,
    tags: [TAGS.categories, "categories:top"],
  });
  return res.data ?? [];
}

/**
 * GET /api/v1/products — каталог с фильтрами и facets.
 *
 * Пустые/дефолтные значения не отправляем: так URL кэша получается
 * короче и Next.js реже промахивается мимо кэша.
 */
export async function getShopProducts(
  params: Partial<CatalogParams> = {}
): Promise<ShopProductsResponse> {
  const brands = params.brands ?? [];

  return apiGet<ShopProductsResponse>("products", {
    params: {
      q: params.q || undefined,
      category: params.category || undefined,
      brand_id: brands.length ? brands.join(",") : undefined,
      remark: params.remark || undefined,
      price_from: params.price_from ?? undefined,
      price_to: params.price_to ?? undefined,
      sort: params.sort && params.sort !== "default" ? params.sort : undefined,
      page: params.page && params.page > 1 ? params.page : undefined,
      per_page: params.per_page ?? undefined,
    },
    revalidate: REVALIDATE.catalog,
    tags: [TAGS.products, "catalog"],
  });
}

/** Пустой ответ — фолбэк, если API недоступен (страница не должна падать). */
export const EMPTY_SHOP_RESPONSE: ShopProductsResponse = {
  data: [],
  meta: {
    current_page: 1,
    from: null,
    to: null,
    last_page: 1,
    per_page: 24,
    total: 0,
    path: "",
  },
  links: { first: null, last: null, prev: null, next: null },
  filters: { brands: [], price: { min: 0, max: 0 } },
};
