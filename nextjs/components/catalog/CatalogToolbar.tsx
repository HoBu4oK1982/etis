"use client";

import { LayoutGrid, LayoutList, SlidersHorizontal } from "lucide-react";
import {
  CATALOG_SORTS,
  PER_PAGE_OPTIONS,
  type CatalogSort,
} from "@/lib/types/catalog";
import { useCatalog } from "./CatalogProvider";
import { CatalogSelect } from "./CatalogSelect";

function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

/**
 * Тулбар каталога.
 *
 * Разметка держится на двух логических рядах (row1 / row2), которые
 * на десктопе выстраиваются в одну строку (count слева, остальное
 * справа — как раньше), а на мобильном (≤767px) реально складываются
 * в два ряда:
 *   ряд 1 — кнопка «Фильтры» + счётчик «Найдено N товаров»;
 *   ряд 2 — сортировка + количество на странице (два селекта в линию).
 */
export function CatalogToolbar({ total }: { total: number }) {
  const { params, update, setDrawerOpen, activeCount } = useCatalog();

  return (
    <div className="etis-cat-toolbar">
      <div className="etis-cat-toolbar__row1">
        <button
          type="button"
          className="etis-cat-mobile-filters"
          onClick={() => setDrawerOpen(true)}
        >
          <SlidersHorizontal size={15} strokeWidth={2.2} />
          Фильтры
          {activeCount > 0 && <b>{activeCount}</b>}
        </button>

        <div className="etis-cat-toolbar__count">
          Найдено <b>{total.toLocaleString("ru-RU")}</b>{" "}
          {plural(total, ["товар", "товара", "товаров"])}
        </div>
      </div>

      <div className="etis-cat-toolbar__row2">
        <CatalogSelect
          value={params.sort}
          ariaLabel="Сортировка"
          className="etis-cat-toolbar__select"
          options={CATALOG_SORTS.map((sort) => ({
            value: sort.value,
            label: sort.label,
          }))}
          onChange={(value) => update({ sort: value as CatalogSort })}
        />

        <CatalogSelect
          value={String(params.per_page)}
          ariaLabel="Товаров на странице"
          className="etis-cat-toolbar__select"
          options={PER_PAGE_OPTIONS.map((count) => ({
            value: String(count),
            label: `${count} на странице`,
          }))}
          onChange={(value) => update({ per_page: Number(value) })}
        />

        <div className="etis-cat-view">
          <button
            type="button"
            aria-label="Плитка"
            className={params.view === "grid" ? "is-active" : ""}
            onClick={() => update({ view: "grid" }, { keepPage: true })}
          >
            <LayoutGrid size={16} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            aria-label="Строка"
            className={params.view === "compact" ? "is-active" : ""}
            onClick={() => update({ view: "compact" }, { keepPage: true })}
          >
            <LayoutList size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
