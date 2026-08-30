"use client";

import { useEffect, useMemo, useState } from "react";
import type { PriceFacet } from "@/lib/types/catalog";
import { formatPrice } from "@/lib/utils/price";
import { useCatalog } from "./CatalogProvider";

/**
 * Фильтр по цене: два ползунка + числовые поля.
 *
 * Значения применяются только по кнопке (или Enter в поле) — иначе
 * каждое движение ползунка дёргало бы навигацию и сервер.
 */
export function FilterPrice({ facet }: { facet: PriceFacet }) {
  const { params, update } = useCatalog();

  const min = Math.max(0, Math.floor(facet.min));
  const max = Math.ceil(facet.max);
  const step = useMemo(() => {
    const span = Math.max(1, max - min);
    if (span > 2_000_000) return 10_000;
    if (span > 500_000) return 5_000;
    if (span > 100_000) return 1_000;
    if (span > 10_000) return 500;
    return 100;
  }, [min, max]);

  const [from, setFrom] = useState<number>(params.price_from ?? min);
  const [to, setTo] = useState<number>(params.price_to ?? max);

  // Синхронизация при внешнем изменении фильтров (сброс, другая категория)
  useEffect(() => {
    setFrom(params.price_from ?? min);
    setTo(params.price_to ?? max);
  }, [params.price_from, params.price_to, min, max]);

  if (max <= 0 || max <= min) {
    return <p className="etis-cat-empty-note">Диапазон цен недоступен</p>;
  }

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const pct = (v: number) => ((clamp(v) - min) / (max - min)) * 100;

  const dirty =
    (params.price_from ?? min) !== clamp(from) || (params.price_to ?? max) !== clamp(to);

  const apply = () => {
    const lo = clamp(Math.min(from, to));
    const hi = clamp(Math.max(from, to));
    update({
      price_from: lo > min ? lo : undefined,
      price_to: hi < max ? hi : undefined,
    });
  };

  return (
    <div>
      <div className="etis-cat-price__inputs">
        <div className="etis-cat-price__field">
          <input
            type="number"
            inputMode="numeric"
            value={from}
            min={min}
            max={max}
            onChange={(e) => setFrom(Number(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            aria-label="Цена от"
          />
          <span>тг</span>
        </div>

        <div className="etis-cat-price__dash">—</div>

        <div className="etis-cat-price__field">
          <input
            type="number"
            inputMode="numeric"
            value={to}
            min={min}
            max={max}
            onChange={(e) => setTo(Number(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            aria-label="Цена до"
          />
          <span>тг</span>
        </div>
      </div>

      <div className="etis-cat-range">
        <div className="etis-cat-range__track" />
        <div
          className="etis-cat-range__fill"
          style={{ left: `${pct(Math.min(from, to))}%`, right: `${100 - pct(Math.max(from, to))}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamp(from)}
          onChange={(e) => setFrom(Math.min(Number(e.target.value), to))}
          aria-label="Минимальная цена"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamp(to)}
          onChange={(e) => setTo(Math.max(Number(e.target.value), from))}
          aria-label="Максимальная цена"
        />
      </div>

      <div className="etis-cat-price__hint">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>

      <button
        type="button"
        className="etis-cat-price__apply"
        disabled={!dirty}
        onClick={apply}
      >
        Применить
      </button>
    </div>
  );
}
