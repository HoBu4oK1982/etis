import { apiFetch } from "./client";
import { REVALIDATE, TAGS } from "./config";
import type { HomeData } from "@/lib/types/home";

/** Формат ответа Laravel API: { data: HomeData } */
type HomeResponse = {
  data: HomeData;
};

/**
 * Загружает всё для главной страницы одним запросом.
 * GET /api/v1/home
 *
 * Кэш: ISR на 5 минут + тег "home" для точечной ревалидации.
 * При падении бэка исключение проброшено выше — HomePage покажет fallback.
 */
export async function getHome(): Promise<HomeData> {
  const res = await apiFetch<HomeResponse>("home", {
    revalidate: REVALIDATE.home,
    tags: [TAGS.home],
  });

  return res.data;
}
