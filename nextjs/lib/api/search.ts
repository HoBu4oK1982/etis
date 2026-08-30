import { apiFetch } from "./client";
import type {
  SearchResponse,
  SuggestResponse,
  PopularResponse,
} from "@/lib/types/search";

/**
 * Полный поиск (страница /search).
 * Кэшируем на 30 секунд — свежие товары/цены должны появляться быстро,
 * но два одинаковых запроса подряд не должны дважды дёргать бэк.
 */
export async function searchAll(
  query: string,
  type?: string,
  limit = 60,
): Promise<SearchResponse> {
  return apiFetch<SearchResponse>("search", {
    revalidate: 30,
    query: { q: query, type, limit },
  });
}

/**
 * Быстрые подсказки для шапки. Кэш не нужен — вводится в реальном времени,
 * фронт сам делает debounce. no-store чтобы каждый keystroke ходил свежий.
 */
export async function suggest(query: string, limit = 8): Promise<SuggestResponse> {
  return apiFetch<SuggestResponse>("search/suggest", {
    noStore: true,
    query: { q: query, limit },
  });
}

/** Популярные запросы (когда поле пустое). */
export async function popularQueries(): Promise<string[]> {
  const res = await apiFetch<PopularResponse>("search/popular", {
    revalidate: 300,
  });
  return Array.isArray(res.data) ? res.data : [];
}

/** Лог клика по результату — для расчёта популярности терминов. */
export async function trackClick(payload: {
  query: string;
  type?: string;
  id?: number;
}): Promise<void> {
  try {
    await apiFetch<{ ok: boolean }>("search/click", {
      method: "POST",
      body: payload,
      noStore: true,
    });
  } catch {
    /* fire-and-forget: неудачный трекинг не должен мешать переходу */
  }
}

/** Лог пустого запроса из dropdown — накопление «дыр» в каталоге. */
export async function trackNoResults(query: string): Promise<void> {
  try {
    await apiFetch<{ ok: boolean }>("search/no-results", {
      method: "POST",
      body: { query },
      noStore: true,
    });
  } catch {
    /* fire-and-forget */
  }
}
