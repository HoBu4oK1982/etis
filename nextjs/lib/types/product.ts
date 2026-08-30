export type ProductRemark = "hit" | "sale" | "new" | null;

/**
 * Лёгкий товар — для каталогов, поиска, related.
 * Совпадает с App\Http\Resources\V1\ProductListResource
 */
export type ProductListItem = {
  id: number;
  title: string;
  slug: string;
  sku: string | null;
  price: number | null;
  selling_price: number | null;
  effective_price: number | null;
  has_discount: boolean;
  remark: ProductRemark;
  thumbnail: string | null;
  brand: {
    id: number;
    title: string;
    slug: string;
    /** Логотип бренда (может отсутствовать) */
    image?: string | null;
  } | null;
  category_id: number | null;
};

export type ProductImage = {
  id: number;
  position: number;
  url: string;
  path: string;
};

export type ProductAttribute = {
  id: number;
  name: string;
  value: string;
  position: number;
};

/**
 * Полный товар — для страницы деталей.
 * Совпадает с App\Http\Resources\V1\ProductResource
 */
export type Product = {
  id: number;
  title: string;
  slug: string;
  sku: string | null;
  price: number | null;
  selling_price: number | null;
  effective_price: number | null;
  has_discount: boolean;
  discount_percent: number | null;
  short_description: string | null;
  description: string | null;
  remark: ProductRemark;
  status: number;
  images: ProductImage[];
  attributes: ProductAttribute[];
  brand: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    image: string | null;
    position: number;
  } | null;
  category: {
    id: number;
    title: string;
    slug: string;
  } | null;
  meta: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
  created_at: string | null;
};
