import type { Paginated } from "./api";
import type { ProductListItem } from "./product";

/* ============================================================
   Категории верхнего уровня (GET /api/v1/categories/top)
   ============================================================ */

export type CategoryTileChild = {
  id: number;
  title: string;
  slug: string;
  products_count: number;
};

export type CategoryTile = {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  short_description: string | null;
  image: string | null;
  position: number;
  products_count: number;
  children: CategoryTileChild[];
};

/* ============================================================
   Facets каталога (GET /api/v1/products → additional.filters)
   ============================================================ */

export type BrandFacet = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  position: number;
  products_count: number;
};

export type PriceFacet = {
  min: number;
  max: number;
};

export type CatalogFacets = {
  brands: BrandFacet[];
  price: PriceFacet;
  /**
   * Категории с укладкой в CategoryTile — тот же формат, что в
   * /categories/top. Приходят из /products начиная с расширения
   * ProductController@index под страницы /hits, /sales, /news.
   * На /shop может отсутствовать (старые ответы) — обрабатываем как [].
   */
  categories?: CategoryTile[];
};

export type ShopProductsResponse = Paginated<ProductListItem> & {
  filters?: CatalogFacets;
};

/* ============================================================
   Параметры каталога — единый контракт URL ↔ API
   ============================================================ */

export type CatalogSort = "default" | "date" | "price" | "price-desc";
export type CatalogRemark = "hit" | "sale" | "new";
export type CatalogView = "grid" | "compact";

export type CatalogParams = {
  q?: string;
  /** slug категории верхнего или второго уровня */
  category?: string;
  /** id брендов (мультивыбор) */
  brands: number[];
  remark?: CatalogRemark;
  price_from?: number;
  price_to?: number;
  sort: CatalogSort;
  page: number;
  per_page: number;
  view: CatalogView;
};

export const CATALOG_SORTS: Array<{ value: CatalogSort; label: string }> = [
  { value: "default", label: "По умолчанию" },
  { value: "date", label: "Сначала новые" },
  { value: "price", label: "Сначала дешёвые" },
  { value: "price-desc", label: "Сначала дорогие" },
];

export const CATALOG_REMARKS: Array<{ value: CatalogRemark; label: string }> = [
  { value: "hit", label: "Хиты" },
  { value: "new", label: "Новинки" },
  { value: "sale", label: "Акции" },
];

export const PER_PAGE_OPTIONS = [12, 24, 48] as const;

export const DEFAULT_CATALOG_PARAMS: CatalogParams = {
  brands: [],
  sort: "default",
  page: 1,
  per_page: 24,
  view: "grid",
};
