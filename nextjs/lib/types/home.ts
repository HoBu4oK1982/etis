/**
 * Типы для главной страницы etis.kz
 * Соответствуют ответу GET /api/v1/home
 * (см. App\Http\Controllers\Api\V1\HomeController)
 */

import type { Category } from "./category";
import type { ProductListItem } from "./product";

export type Meta = {
  title: string | null;
  description: string | null;
  keywords: string | null;
};

/**
 * Слайд из App\Http\Resources\V1\SliderResource
 *
 * Порядок полей повторяет ответ Laravel; eyebrow добавлен миграцией
 * 2026_07_21_190000_add_eyebrow_to_sliders — это плашка над заголовком
 * ("ОБОРУДОВАНИЕ. ИНЖИНИРИНГ. НАДЁЖНОСТЬ.").
 *
 * ВАЖНО: тип должен быть 1:1 с Slider в lib/types/misc.ts, потому что
 * HeroSlider.tsx принимает slides: Slider[]. Раньше здесь не было eyebrow —
 * из-за этого TS был рассинхронизирован с рантаймом.
 */
export type Slide = {
  id: number;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  image: string | null; // absolute URL (asset())
  position: number;
};

/** Статья-превью из App\Http\Resources\V1\ArticleResource (без content) */
export type ArticlePreview = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  meta: Meta;
  created_at: string | null;
};

/**
 * Бренд-партнёр для карусели на главной.
 * Совпадает с App\Http\Resources\V1\BrandResource; на бэке отдаются
 * только те, у которых загружен логотип (image != null),
 * поэтому здесь тип уже сужен.
 */
export type PartnerBrand = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string;
  position: number;
};

/** Полный ответ GET /api/v1/home */
export type HomeData = {
  slides: Slide[];
  root_categories: Category[];
  hits: ProductListItem[];
  sales: ProductListItem[];
  news: ProductListItem[];
  articles: ArticlePreview[];
  partners: PartnerBrand[];
};

export type { Category, ProductListItem };
