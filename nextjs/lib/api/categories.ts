import { apiGet } from "./server";
import type { ApiSingle, ApiCollection, Paginated } from "../types/api";
import type { CategoryPageData, CategoryTreeNode } from "../types/category";
import type { ProductListItem } from "../types/product";
import type { CatalogFacets } from "../types/catalog";

/**
 * GET /api/v1/categories/tree
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const res = await apiGet<ApiCollection<CategoryTreeNode>>("categories/tree", {
    revalidate: 600,
    tags: ["categories", "tree"],
  });
  return res.data;
}

/**
 * GET /api/v1/categories/{slug}?path=level2/level3/...
 */
export async function getCategory(slug: string, path?: string): Promise<CategoryPageData> {
  const res = await apiGet<ApiSingle<CategoryPageData>>(`categories/${slug}`, {
    params: { path },
    revalidate: 300,
    tags: ["categories", `category:${slug}`],
  });
  return res.data;
}

export type CategoryProductsParams = {
  /** Путь вложенных категорий: "level2/level3" */
  path?: string;
  /** ID брендов через запятую — мультивыбор */
  brand_id?: string;
  remark?: "hit" | "sale" | "new";
  price_from?: number;
  price_to?: number;
  sort?: "default" | "date" | "price" | "price-desc";
  page?: number;
  per_page?: number;
};

export type CategoryProductsResponse = Paginated<ProductListItem> & {
  filters?: CatalogFacets;
};

/**
 * GET /api/v1/categories/{slug}/products
 */
export async function getCategoryProducts(
  slug: string,
  params: CategoryProductsParams = {}
): Promise<CategoryProductsResponse> {
  return apiGet<CategoryProductsResponse>(`categories/${slug}/products`, {
    params,
    revalidate: 180,
    tags: ["products", `category:${slug}:products`],
  });
}
