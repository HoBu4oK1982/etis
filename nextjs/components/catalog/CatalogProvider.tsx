"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLenis } from "@/components/providers/LenisProvider";
import type { CatalogParams } from "@/lib/types/catalog";
import {
  buildCatalogQuery,
  countActiveFilters,
  hasActiveFilters,
  parseCatalogParams,
} from "@/lib/utils/catalog-params";
import { DEFAULT_CATALOG_PARAMS } from "@/lib/types/catalog";
import { MobileFilterFab } from "./MobileFilterFab";

type Patch = Partial<CatalogParams>;

type CatalogContextValue = {
  params: CatalogParams;
  /**
   * Обновить параметры. По умолчанию сбрасывает страницу на 1
   * и плавно поднимает к началу выдачи (scrollTop: false — отключить).
   */
  update: (patch: Patch, options?: { keepPage?: boolean; scrollTop?: boolean }) => void;
  /** Сбросить все фильтры (сортировка и вид сохраняются). */
  reset: () => void;
  toggleBrand: (id: number) => void;
  /** Идёт навигация — гасим сетку и блокируем повторные клики. */
  isPending: boolean;
  activeCount: number;
  hasFilters: boolean;
  /** Мобильная шторка фильтров */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog должен использоваться внутри <CatalogProvider>");
  }
  return ctx;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const lenis = useLenis();

  const params = useMemo(
    () => parseCatalogParams(searchParams),
    [searchParams]
  );

  /**
   * Плавный подъём к началу выдачи.
   *
   * Целимся не в самый верх документа, а в контейнер с товарами
   * (data-catalog-top): после смены фильтра пользователь должен увидеть
   * первый ряд карточек, а не проматывать хлебные крошки заново.
   * Через Lenis, а не window.scrollTo — нативный smooth дерётся
   * со смуз-скроллом за управление и даёт рывок.
   */
  const scrollToResults = useCallback(() => {
    if (typeof window === "undefined") return;

    const target = document.querySelector<HTMLElement>("[data-catalog-top]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (lenis) {
      if (target) lenis.scrollTo(target, { offset: -120, duration: reduced ? 0 : 0.9 });
      else lenis.scrollTo(0, { duration: reduced ? 0 : 0.9 });
      return;
    }

    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: Math.max(0, top), behavior });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  }, [lenis]);

  const push = useCallback(
    (next: CatalogParams, scrollTop: boolean) => {
      const url = `${pathname}${buildCatalogQuery(next)}`;
      startTransition(() => {
        router.push(url, { scroll: false });
        if (scrollTop) scrollToResults();
      });
    },
    [pathname, router, scrollToResults]
  );

  const update = useCallback<CatalogContextValue["update"]>(
    (patch, options) => {
      const next: CatalogParams = {
        ...params,
        ...patch,
        page: options?.keepPage ? (patch.page ?? params.page) : (patch.page ?? 1),
      };
      push(next, options?.scrollTop ?? true);
    },
    [params, push]
  );

  const reset = useCallback(() => {
    push(
      {
        ...DEFAULT_CATALOG_PARAMS,
        brands: [],
        sort: params.sort,
        per_page: params.per_page,
        view: params.view,
      },
      true
    );
  }, [params.sort, params.per_page, params.view, push]);

  const toggleBrand = useCallback(
    (id: number) => {
      const brands = params.brands.includes(id)
        ? params.brands.filter((b) => b !== id)
        : [...params.brands, id];
      update({ brands });
    },
    [params.brands, update]
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      params,
      update,
      reset,
      toggleBrand,
      isPending,
      activeCount: countActiveFilters(params),
      hasFilters: hasActiveFilters(params),
      drawerOpen,
      setDrawerOpen,
    }),
    [params, update, reset, toggleBrand, isPending, drawerOpen]
  );

  return (
    <CatalogContext.Provider value={value}>
      {children}
      <MobileFilterFab />
    </CatalogContext.Provider>
  );
}
