/**
 * Формат ответов Laravel API.
 *
 * Одиночный ресурс:
 *   { data: T }
 *
 * Список с пагинацией (Laravel ResourceCollection):
 *   { data: T[], meta: {...}, links: {...} }
 */

export type ApiSingle<T> = {
  data: T;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  to: number | null;
  last_page: number;
  per_page: number;
  total: number;
  path: string;
};

export type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
};

export type ApiCollection<T> = {
  data: T[];
};
