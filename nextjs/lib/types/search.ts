/**
 * Типы ответов умного поиска etis.kz.
 * Соответствуют App\Http\Controllers\Api\V1\SearchController.
 */

export type SearchType = "product" | "category" | "brand" | "article";

export type MatchInfo = {
  body_only?: boolean;
  requires_body?: boolean;
  matched_fields?: string[];
  manual_boost?: number;
  how?: Record<string, unknown>;
};

/** Один элемент выдачи (полный) */
export type SearchResultItem = {
  id: number;
  type: SearchType | string;
  title: string;
  url: string;
  image: string | null;
  price: number | null;
  currency: string | null;
  score: number;
  match?: MatchInfo;
};

/** Ответ GET /api/v1/search */
export type SearchResponse = {
  query: string;
  corrected: { query: string } | null;
  total: number;
  results: SearchResultItem[];
  groups: Partial<Record<string, SearchResultItem[]>>;
};

/** Подсказка (не-товарная) для дропдауна шапки */
export type Suggestion = {
  text: string;
  type: SearchType | string;
  url: string;
  score?: number;
};

/** Товар из подсказок */
export type SuggestProduct = SearchResultItem;

/** Ответ GET /api/v1/search/suggest */
export type SuggestResponse = {
  query: string;
  corrected: { query: string } | null;
  suggestions: Suggestion[];
  products: SuggestProduct[];
  popular?: string[];
};

/** Ответ GET /api/v1/search/popular */
export type PopularResponse = {
  data: string[];
};
