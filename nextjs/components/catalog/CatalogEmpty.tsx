"use client";

import { PackageSearch } from "lucide-react";
import { useCatalog } from "./CatalogProvider";

export function CatalogEmpty() {
  const { reset, hasFilters } = useCatalog();

  return (
    <div className="etis-cat-empty">
      <div className="etis-cat-empty__icon">
        <PackageSearch size={32} strokeWidth={1.7} />
      </div>

      <h3>Ничего не нашлось</h3>
      <p>
        {hasFilters
          ? "По выбранным параметрам товаров нет. Попробуйте расширить диапазон цен или снять часть фильтров."
          : "В этом разделе пока нет товаров. Загляните позже или напишите нам — подберём аналог."}
      </p>

      {hasFilters && (
        <button type="button" onClick={reset}>
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}
