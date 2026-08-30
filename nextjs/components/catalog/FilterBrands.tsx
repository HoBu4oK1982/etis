"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import type { BrandFacet } from "@/lib/types/catalog";
import { useCatalog } from "./CatalogProvider";

const VISIBLE_LIMIT = 8;

/**
 * Фильтр по брендам. Мультивыбор — в URL уходит brands=1,5,9,
 * на бэке разбирается в whereIn. Счётчики приходят из facets и
 * считаются без учёта самого фильтра по бренду, поэтому список
 * не схлопывается после первого выбора.
 */
export function FilterBrands({ brands }: { brands: BrandFacet[] }) {
  const { params, toggleBrand } = useCatalog();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? brands.filter((b) => b.title.toLowerCase().includes(q))
      : brands;

    // Выбранные — наверх, чтобы не терялись под "показать все"
    return [...list].sort((a, b) => {
      const aSel = params.brands.includes(a.id) ? 0 : 1;
      const bSel = params.brands.includes(b.id) ? 0 : 1;
      return aSel - bSel || a.title.localeCompare(b.title, "ru");
    });
  }, [brands, query, params.brands]);

  const visible = expanded || query ? filtered : filtered.slice(0, VISIBLE_LIMIT);

  if (brands.length === 0) {
    return <p className="etis-cat-empty-note">Для текущей выборки брендов нет</p>;
  }

  return (
    <div>
      {brands.length > VISIBLE_LIMIT && (
        <div className="etis-cat-brand-search">
          <Search size={15} strokeWidth={2.2} />
          <input
            type="text"
            value={query}
            placeholder="Найти бренд"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className="etis-cat-check-list" data-lenis-prevent>
        {visible.map((brand) => {
          const checked = params.brands.includes(brand.id);
          return (
            <label key={brand.id} className="etis-cat-check">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleBrand(brand.id)}
              />
              <span className="etis-cat-check__box">
                <Check size={12} strokeWidth={3.2} />
              </span>
              <span className="etis-cat-check__label">{brand.title}</span>
              <span className="etis-cat-check__num">{brand.products_count}</span>
            </label>
          );
        })}

        {visible.length === 0 && (
          <p className="etis-cat-empty-note">Ничего не найдено</p>
        )}
      </div>

      {!query && filtered.length > VISIBLE_LIMIT && (
        <button
          type="button"
          className="etis-cat-more"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Свернуть" : `Показать все (${filtered.length})`}
        </button>
      )}
    </div>
  );
}
