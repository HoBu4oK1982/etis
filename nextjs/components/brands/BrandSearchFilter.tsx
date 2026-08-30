"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useCatalog } from "@/components/catalog/CatalogProvider";

/**
 * Поиск внутри ассортимента бренда. Значение уезжает в URL (?q=)
 * с задержкой — иначе навигация дёргалась бы на каждый символ.
 */
export function BrandSearchFilter() {
  const { params, update } = useCatalog();
  const [value, setValue] = useState(params.q ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Внешнее изменение (сброс фильтров, переход по ссылке)
  useEffect(() => {
    setValue(params.q ?? "");
  }, [params.q]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const push = (next: string) => {
    const clean = next.trim();
    if (clean === (params.q ?? "")) return;
    update({ q: clean || undefined });
  };

  const onChange = (next: string) => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(next), 450);
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    setValue("");
    update({ q: undefined });
  };

  return (
    <div className="etis-brand-qsearch">
      <Search size={15} strokeWidth={2.2} />
      <input
        type="text"
        value={value}
        placeholder="Модель, артикул…"
        aria-label="Поиск по товарам бренда"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (timer.current) clearTimeout(timer.current);
            push(value);
          }
        }}
      />
      {value && (
        <button type="button" aria-label="Очистить поиск" onClick={clear}>
          <X size={14} strokeWidth={2.6} />
        </button>
      )}
    </div>
  );
}
