import { apiGet } from "./server";
import type { ApiSingle, ApiCollection, Paginated } from "../types/api";
import type { Article, Brand } from "../types/misc";
import type { ProductListItem } from "../types/product";

/**
 * GET /api/v1/brands
 */
export async function getBrands(): Promise<Brand[]> {
  const res = await apiGet<ApiCollection<Brand>>("brands", {
    revalidate: 600,
    tags: ["brands"],
  });
  return res.data;
}

export async function getBrand(slug: string): Promise<Brand> {
  const res = await apiGet<ApiSingle<Brand>>(`brands/${slug}`, {
    revalidate: 600,
    tags: [`brand:${slug}`],
  });
  return res.data;
}

export async function getBrandProducts(
  slug: string,
  params: { sort?: string; page?: number; per_page?: number; price_from?: number; price_to?: number } = {}
): Promise<Paginated<ProductListItem> & { brand?: Brand }> {
  return apiGet<Paginated<ProductListItem> & { brand?: Brand }>(`brands/${slug}/products`, {
    params,
    revalidate: 180,
    tags: [`brand:${slug}:products`],
  });
}

export async function getArticles(): Promise<Paginated<Article>> {
  return apiGet<Paginated<Article>>("articles", {
    revalidate: 600,
    tags: ["articles"],
  });
}

export async function getArticle(slug: string): Promise<Article> {
  const res = await apiGet<ApiSingle<Article>>(`articles/${slug}`, {
    revalidate: 600,
    tags: [`article:${slug}`],
  });
  return res.data;
}
