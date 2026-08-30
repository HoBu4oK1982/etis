import { apiGet, apiPost } from "./server";
import type { ApiSingle, Paginated } from "../types/api";
import type { Product, ProductListItem } from "../types/product";

export type ProductListParams = {
  q?: string;
  remark?: "hit" | "sale" | "new";
  sort?: "default" | "date" | "price" | "price-desc";
  page?: number;
  per_page?: number;
};

/**
 * GET /api/v1/products
 */
export async function getProducts(params: ProductListParams = {}): Promise<Paginated<ProductListItem>> {
  return apiGet<Paginated<ProductListItem>>("products", {
    params,
    revalidate: 180,
    tags: ["products"],
  });
}

export type ProductPageResponse = {
  data: Product;
  related: { data: ProductListItem[] };
};

/**
 * GET /api/v1/products/{slug}
 */
export async function getProduct(slug: string): Promise<ProductPageResponse> {
  return apiGet<ProductPageResponse>(`products/${slug}`, {
    revalidate: 600,
    tags: ["products", `product:${slug}`],
  });
}

export type CartValidateItem = { product_id: number; qty: number };
export type CartValidateResponse = {
  data: {
    items: Array<{
      product_id: number;
      available: boolean;
      reason?: string;
      title?: string;
      slug?: string;
      price?: number;
      qty?: number;
      sum?: number;
    }>;
    subtotal: number;
    total: number;
  };
};

/**
 * POST /api/v1/cart/validate — валидация корзины (актуальные цены)
 */
export async function validateCart(items: CartValidateItem[]): Promise<CartValidateResponse> {
  return apiPost<CartValidateResponse>("cart/validate", { items });
}
