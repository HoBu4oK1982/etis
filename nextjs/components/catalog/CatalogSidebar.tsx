"use client";

import { Flame, Sparkles, BadgePercent } from "lucide-react";
import { CATALOG_REMARKS, type BrandFacet, type CategoryTile, type PriceFacet } from "@/lib/types/catalog";
import { FilterSection } from "./FilterSection";
import { FilterCategories } from "./FilterCategories";
import { FilterBrands } from "./FilterBrands";
import { FilterPrice } from "./FilterPrice";
import { useCatalog } from "./CatalogProvider";

type Props = {
  categories: CategoryTile[];
  brands: BrandFacet[];
  price: PriceFacet;
};

const REMARK_ICONS = {
  hit: Flame,
  new: Sparkles,
  sale: BadgePercent,
} as const;

/**
 * Панель фильтров. Один и тот же компонент используется
 * и в десктопном сайдбаре, и внутри мобильной шторки.
 */
export function CatalogSidebar({ categories, brands, price }: Props) {
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

      <FilterSection title="Категории">
        <FilterCategories categories={categories} />
      </FilterSection>

      <FilterSection title="Подборки">
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

      <FilterSection title="Цена">
        <FilterPrice facet={price} />
      </FilterSection>

      <FilterSection title="Бренд">
        <FilterBrands brands={brands} />
      </FilterSection>
    </div>
  );
}
