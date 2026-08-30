"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import type { BrandListItem } from "@/lib/types/brand";
import { BrandCard } from "./BrandCard";
import { BrandAlphabet } from "./BrandAlphabet";

/**
 * Витрина брендов: поиск по названию, фильтр по первой букве и
 * переключатель «только с товарами». Фильтрация клиентская — брендов
 * десятки, а не тысячи, лишний раунд-трип к API тут не нужен.
 */
export function BrandsExplorer({ brands }: { brands: BrandListItem[] }) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [onlyWithProducts, setOnlyWithProducts] = useState(false);

  const letters = useMemo(() => {
    const set = new Set<string>();
    brands.forEach((b) => {
      const ch = firstLetter(b.title);
      if (ch) set.add(ch);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [brands]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return brands
      .filter((b) => {
        if (onlyWithProducts && b.products_count === 0) return false;
        if (letter && firstLetter(b.title) !== letter) return false;
        if (q && !b.title.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        // Бренды без товаров — в конец списка
        const aEmpty = a.products_count === 0 ? 1 : 0;
        const bEmpty = b.products_count === 0 ? 1 : 0;
        return aEmpty - bEmpty || a.title.localeCompare(b.title, "ru");
      });
  }, [brands, query, letter, onlyWithProducts]);

  const dirty = Boolean(query || letter || onlyWithProducts);

  const reset = () => {
    setQuery("");
    setLetter(null);
    setOnlyWithProducts(false);
  };

  return (
    <div className="etis-brands">
      <div className="etis-brands__controls">
        <div className="etis-brands__search">
          <Search size={17} strokeWidth={2.2} />
          <input
            type="text"
            value={query}
            placeholder="Поиск бренда — Baxi, Grundfos, Wilo…"
            aria-label="Поиск бренда"
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" aria-label="Очистить" onClick={() => setQuery("")}>
              <X size={15} strokeWidth={2.6} />
            </button>
          )}
        </div>

        <label className="etis-brands__toggle">
          <input
            type="checkbox"
            checked={onlyWithProducts}
            onChange={(e) => setOnlyWithProducts(e.target.checked)}
          />
          <span className="etis-brands__toggle-track">
            <span className="etis-brands__toggle-dot" />
          </span>
          Только с товарами
        </label>
      </div>

      <BrandAlphabet letters={letters} active={letter} onSelect={setLetter} />

      <div className="etis-brands__meta">
        <span>
          Показано <b>{filtered.length}</b> из {brands.length}
        </span>
        {dirty && (
          <button type="button" onClick={reset}>
            Сбросить
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="etis-brands__empty">
          <h3>Бренд не найден</h3>
          <p>
            Проверьте написание или посмотрите весь список — возможно, нужное
            оборудование продаётся под другой маркой.
          </p>
          <button type="button" onClick={reset}>
            Показать все бренды
          </button>
        </div>
      ) : (
        <motion.div className="etis-brands__grid" layout>
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((brand, i) => (
              <motion.div
                key={brand.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.38,
                    delay: Math.min(i * 0.025, 0.3),
                    ease: [0.22, 1, 0.36, 1],
                  },
                }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
              >
                <BrandCard brand={brand} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/** Первая буква названия в верхнем регистре (цифры сводим в «#»). */
function firstLetter(title: string): string | null {
  const ch = title.trim()[0];
  if (!ch) return null;
  if (/\d/.test(ch)) return "#";
  return ch.toUpperCase();
}
