"use client";

import type { BrandFacet, CategoryTile, PriceFacet } from "@/lib/types/catalog";
import { FilterSection } from "./FilterSection";
import { FilterBrands } from "./FilterBrands";
import { FilterPrice } from "./FilterPrice";
import { FilterCategories } from "./FilterCategories";
import { useCatalog } from "./CatalogProvider";

type Props = {
  categories: CategoryTile[];
  brands: BrandFacet[];
  price: PriceFacet;
};

/**
 * Панель фильтров для страниц /hits, /sales, /news.
 *
 * От CategoryFiltersPanel отличается двумя вещами:
 *  1. Нет секции «Подборки» — сам факт того, что пользователь на этой
 *     странице, уже означает выбранный remark. Показывать его как
 *     переключаемую опцию — сбивать с толку.
 *  2. Категории — фильтр, а не корневой скоуп; идут через тот же
 *     FilterCategories, что и на /shop, только без CategoryAccordion
 *     (не нужен путь вглубь — здесь один плоский срез каталога).
 */
export function RemarkFiltersPanel({ categories, brands, price }: Props) {
  const { params, reset, hasFilters } = useCatalog();

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

      <FilterSection title="Бренд" defaultOpen={params.brands.length > 0}>
        <FilterBrands brands={brands} />
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
