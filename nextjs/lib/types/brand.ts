import type { Paginated } from "./api";
import type { CategoryTile, PriceFacet } from "./catalog";
import type { ProductListItem } from "./product";

/**
 * Бренд в списке /brands.
 * Совпадает с BrandResource + products_count из BrandController::index.
 */
export type BrandListItem = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  position: number;
  products_count: number;
};

/**
 * Бренд на странице /brands/{slug} — добавляются агрегаты для шапки.
 */
export type BrandDetail = BrandListItem & {
  categories_count: number;
  min_price: number | null;
};

export type BrandsResponse = {
  data: BrandListItem[];
  meta: {
    total: number;
    products_total: number;
    with_products: number;
  };
};

/** Счётчики подборок внутри ассортимента бренда. */
export type RemarkFacets = {
  hit: number;
  new: number;
  sale: number;
};

/**
 * Facets страницы бренда. Категории приходят в том же формате,
 * что и categories/top (CategoryTile), поэтому переиспользуется
 * готовый <FilterCategories> из каталога.
 */
export type BrandFacets = {
  categories: CategoryTile[];
  price: PriceFacet;
  remarks: RemarkFacets;
};

export type BrandProductsResponse = Paginated<ProductListItem> & {
  brand?: BrandDetail;
  filters?: BrandFacets;
};

/** Фолбэк, если API недоступен — страница не должна падать. */
export const EMPTY_BRAND_PRODUCTS: BrandProductsResponse = {
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
  filters: {
    categories: [],
    price: { min: 0, max: 0 },
    remarks: { hit: 0, new: 0, sale: 0 },
  },
};
