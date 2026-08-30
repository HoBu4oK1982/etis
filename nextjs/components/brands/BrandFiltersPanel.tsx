"use client";

import { BadgePercent, Flame, Sparkles } from "lucide-react";
import { CATALOG_REMARKS, type CategoryTile, type PriceFacet } from "@/lib/types/catalog";
import type { BrandDetail, RemarkFacets } from "@/lib/types/brand";
import { FilterSection } from "@/components/catalog/FilterSection";
import { FilterCategories } from "@/components/catalog/FilterCategories";
import { FilterPrice } from "@/components/catalog/FilterPrice";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { BrandLogo } from "./BrandLogo";
import { BrandSearchFilter } from "./BrandSearchFilter";

type Props = {
  brand: BrandDetail;
  categories: CategoryTile[];
  price: PriceFacet;
  remarks: RemarkFacets;
};

const REMARK_ICONS = {
  hit: Flame,
  new: Sparkles,
  sale: BadgePercent,
} as const;

/**
 * Сайдбар страницы бренда: карточка бренда, поиск по ассортименту,
 * разделы (только те, где бренд представлен), подборки со счётчиками
 * и цена. Тот же компонент подставляется в мобильную шторку.
 */
export function BrandFiltersPanel({ brand, categories, price, remarks }: Props) {
  const { params, update, reset, hasFilters } = useCatalog();

  return (
    <div className="etis-cat-filters etis-brand-filters">
      {/* Карточка бренда — чтобы при скролле фильтров было видно,
          в чьём ассортименте идёт выбор */}
      <div className="etis-brand-side">
        <span className="etis-brand-side__logo">
          <BrandLogo title={brand.title} image={brand.image} sizes="150px" />
        </span>
        <div className="etis-brand-side__meta">
          <strong>{brand.title}</strong>
          <span>{brand.products_count.toLocaleString("ru-RU")} товаров</span>
        </div>
      </div>

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

      <FilterSection title="Поиск по бренду" defaultOpen={Boolean(params.q)}>
        <BrandSearchFilter />
      </FilterSection>

      <FilterSection title="Разделы">
        <FilterCategories categories={categories} />
      </FilterSection>

      <FilterSection title="Подборки" defaultOpen={Boolean(params.remark)}>
        <div className="etis-cat-chips">
          {CATALOG_REMARKS.map((r) => {
            const Icon = REMARK_ICONS[r.value];
            const count = remarks[r.value] ?? 0;
            const active = params.remark === r.value;

            if (count === 0 && !active) return null;

            return (
              <button
                key={r.value}
                type="button"
                className={`etis-cat-chip${active ? " is-active" : ""}`}
                onClick={() => update({ remark: active ? undefined : r.value })}
              >
                <Icon size={14} strokeWidth={2.2} />
                {r.label}
                <b className="etis-brand-chip__num">{count}</b>
              </button>
            );
          })}

          {remarks.hit + remarks.new + remarks.sale === 0 && (
            <p className="etis-cat-empty-note">Подборок в этом бренде нет</p>
          )}
        </div>
      </FilterSection>

      <FilterSection
        title="Цена"
        defaultOpen={params.price_from !== undefined || params.price_to !== undefined}
      >
        <FilterPrice facet={price} />
      </FilterSection>
    </div>
  );
}
