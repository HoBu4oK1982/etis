"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/lib/types/api";
import { useCatalog } from "./CatalogProvider";

/**
 * Пагинация с «окном» страниц вокруг текущей и многоточиями.
 * При смене страницы скроллим наверх — иначе пользователь остаётся
 * в середине уже другой выдачи.
 */
export function CatalogPagination({ meta }: { meta: PaginationMeta }) {
  const { update, isPending } = useCatalog();

  const current = meta.current_page;
  const last = meta.last_page;

  if (!last || last <= 1) return null;

  const go = (page: number) => {
    if (page < 1 || page > last || page === current) return;
    update({ page }, { keepPage: true, scrollTop: true });
  };

  const pages = buildPages(current, last);

  return (
    <nav className="etis-cat-pagination" aria-label="Страницы каталога">
      <button
        type="button"
        aria-label="Предыдущая страница"
        disabled={current <= 1 || isPending}
        onClick={() => go(current - 1)}
      >
        <ChevronLeft size={16} strokeWidth={2.4} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`}>…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={p === current ? "is-active" : ""}
            disabled={isPending}
            onClick={() => go(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        aria-label="Следующая страница"
        disabled={current >= last || isPending}
        onClick={() => go(current + 1)}
      >
        <ChevronRight size={16} strokeWidth={2.4} />
      </button>
    </nav>
  );
}

function buildPages(current: number, last: number): Array<number | "…"> {
  const out: Array<number | "…"> = [];
  const window = 1;

  const push = (n: number) => {
    if (!out.includes(n)) out.push(n);
  };

  push(1);

  if (current - window > 2) out.push("…");

  for (let i = Math.max(2, current - window); i <= Math.min(last - 1, current + window); i++) {
    push(i);
  }

  if (current + window < last - 1) out.push("…");

  if (last > 1) push(last);

  return out;
}
