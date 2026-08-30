"use client";

import { Flame, Sparkles, BadgePercent } from "lucide-react";
import { CATALOG_REMARKS, type BrandFacet, type PriceFacet } from "@/lib/types/catalog";
import type { CategoryTreeNode } from "@/lib/types/category";
import { FilterSection } from "./FilterSection";
import { FilterBrands } from "./FilterBrands";
import { FilterPrice } from "./FilterPrice";
import { CategoryAccordion } from "./CategoryAccordion";
import { useCatalog } from "./CatalogProvider";

type Props = {
  tree: CategoryTreeNode;
  rootSlug: string;
  pathSegments: string[];
  counts?: Record<string, number>;
  brands: BrandFacet[];
  price: PriceFacet;
};

const REMARK_ICONS = {
  hit: Flame,
  new: Sparkles,
  sale: BadgePercent,
} as const;

/**
 * Сайдбар страницы категории: аккордеон подкатегорий + фильтры.
 * Тот же компонент подставляется в мобильную шторку.
 */
export function CategoryFiltersPanel({
  tree,
  rootSlug,
  pathSegments,
  counts,
  brands,
  price,
}: Props) {
  const { params, update, reset, hasFilters } = useCatalog();

  return (
    <div className="etis-cat-filters">
      <div className="etis-cat-filters__head">
        <strong>Фильтры</strong>
        <button
          type="button"
          className="etis-cat-filters__reset"
          onClick={reset}
          disabled={!hasFilters}
        >
          Сбросить
        </button>
      </div>

      {/* Открыт только список подкатегорий — остальное сворачиваем,
          чтобы панель помещалась в экран без внутреннего скролла.
          Секция раскрывается сама, если в ней уже есть активный фильтр. */}
      <FilterSection title="Подкатегории">
        <CategoryAccordion
          tree={tree}
          rootSlug={rootSlug}
          pathSegments={pathSegments}
          counts={counts}
        />
      </FilterSection>

      <FilterSection title="Подборки" defaultOpen={Boolean(params.remark)}>
        <div className="etis-cat-chips">
          {CATALOG_REMARKS.map((r) => {
            const Icon = REMARK_ICONS[r.value];
            const active = params.remark === r.value;
            return (
              <button
                key={r.value}
                type="button"
                className={`etis-cat-chip${active ? " is-active" : ""}`}
                onClick={() => update({ remark: active ? undefined : r.value })}
              >
                <Icon size={14} strokeWidth={2.2} />
                {r.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection
        title="Цена"
        defaultOpen={params.price_from !== undefined || params.price_to !== undefined}
      >
        <FilterPrice facet={price} />
      </FilterSection>

      <FilterSection title="Бренд" defaultOpen={params.brands.length > 0}>
        <FilterBrands brands={brands} />
      </FilterSection>
    </div>
  );
}
