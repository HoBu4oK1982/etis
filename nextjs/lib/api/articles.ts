import { apiGet } from "./server";
import type { ApiSingle, Paginated } from "@/lib/types/api";
import type { Article } from "@/lib/types/misc";

export type ArticleItem = Article & {
  reading_time?: number;
  updated_at?: string | null;
};

export type ArticleSort = "newest" | "oldest";

const ARTICLES_PER_PAGE = 12;

export const EMPTY_ARTICLES_RESPONSE: Paginated<ArticleItem> = {
  data: [],
  meta: {
    current_page: 1,
    from: null,
    to: null,
    last_page: 1,
    per_page: ARTICLES_PER_PAGE,
    total: 0,
    path: "",
  },
  links: { first: null, last: null, prev: null, next: null },
};

/** GET /api/v1/articles?page=... */
export async function getArticles(page = 1): Promise<Paginated<ArticleItem>> {
  return apiGet<Paginated<ArticleItem>>("articles", {
    params: { page },
    revalidate: 300,
    tags: ["articles"],
  });
}

/**
 * Загружает опубликованные статьи, сортирует их по дате глобально и затем
 * применяет пагинацию. Так порядок остаётся правильным даже при нескольких
 * страницах Laravel API.
 */
export async function getSortedArticles(
  page = 1,
  sort: ArticleSort = "newest",
): Promise<Paginated<ArticleItem>> {
  const first = await getArticles(1);
  const apiLastPage = Math.max(1, first.meta.last_page || 1);

  const rest =
    apiLastPage > 1
      ? await Promise.all(
          Array.from({ length: apiLastPage - 1 }, (_, index) => getArticles(index + 2)),
        )
      : [];

  const all = [first, ...rest].flatMap((response) => response.data || []);

  all.sort((left, right) => {
    const delta = articleTimestamp(left) - articleTimestamp(right);
    if (delta !== 0) return sort === "oldest" ? delta : -delta;

    const leftId = Number(left.id) || 0;
    const rightId = Number(right.id) || 0;
    return sort === "oldest" ? leftId - rightId : rightId - leftId;
  });

  const total = all.length;
  const lastPage = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * ARTICLES_PER_PAGE;
  const data = all.slice(start, start + ARTICLES_PER_PAGE);

  return {
    data,
    meta: {
      current_page: currentPage,
      from: data.length ? start + 1 : null,
      to: data.length ? start + data.length : null,
      last_page: lastPage,
      per_page: ARTICLES_PER_PAGE,
      total,
      path: first.meta.path || "/articles",
    },
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
  };
}

/** GET /api/v1/articles/{slug} */
export async function getArticle(slug: string): Promise<ArticleItem> {
  const response = await apiGet<ApiSingle<ArticleItem>>(
    `articles/${encodeURIComponent(slug)}`,
    {
      revalidate: 600,
      tags: ["articles", `article:${slug}`],
    },
  );

  return response.data;
}

function articleTimestamp(article: ArticleItem): number {
  const value = article.created_at || article.updated_at || "";
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}
