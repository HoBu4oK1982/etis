"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CATALOG_REMARKS, type BrandFacet, type CategoryTile } from "@/lib/types/catalog";
import { formatPrice, CURRENCY_SYMBOL } from "@/lib/utils/price";
import { useCatalog } from "./CatalogProvider";

type Pill = { key: string; label: string; clear: () => void };

/**
 * Чипы активных фильтров с быстрым снятием.
 * Живут между тулбаром и сеткой — пользователь всегда видит,
 * почему выборка именно такая.
 *
 * hideRemark — на страницах /hits, /sales, /news подборка навязана
 * маршрутом, снимать её нечем. Чипа только сбивала бы с толку.
 */
export function ActiveFilters({
  categories,
  brands,
  hideRemark = false,
}: {
  categories: CategoryTile[];
  brands: BrandFacet[];
  hideRemark?: boolean;
}) {
  const { params, update, reset, toggleBrand, hasFilters } = useCatalog();

  if (!hasFilters) return null;

  const pills: Pill[] = [];

  if (params.q) {
    pills.push({
      key: "q",
      label: `Поиск: ${params.q}`,
      clear: () => update({ q: undefined }),
    });
  }

  if (params.category) {
    const flat = categories.flatMap((c) => [
      { slug: c.slug, title: c.title },
      ...c.children.map((ch) => ({ slug: ch.slug, title: ch.title })),
    ]);
    const found = flat.find((c) => c.slug === params.category);
    pills.push({
      key: "category",
      label: found?.title ?? params.category,
      clear: () => update({ category: undefined }),
    });
  }

  if (params.remark && !hideRemark) {
    const label = CATALOG_REMARKS.find((r) => r.value === params.remark)?.label;
    pills.push({
      key: "remark",
      label: label ?? params.remark,
      clear: () => update({ remark: undefined }),
    });
  }

  params.brands.forEach((id) => {
    const brand = brands.find((b) => b.id === id);
    pills.push({
      key: `brand-${id}`,
      label: brand?.title ?? `Бренд #${id}`,
      clear: () => toggleBrand(id),
    });
  });

  if (params.price_from !== undefined || params.price_to !== undefined) {
    const from = params.price_from !== undefined ? formatPrice(params.price_from) : `0 ${CURRENCY_SYMBOL}`;
    const to = params.price_to !== undefined ? formatPrice(params.price_to) : "∞";
    pills.push({
      key: "price",
      label: `${from} — ${to}`,
      clear: () => update({ price_from: undefined, price_to: undefined }),
    });
  }

  return (
    <div className="etis-cat-active">
      <AnimatePresence initial={false}>
        {pills.map((pill) => (
          <motion.button
            key={pill.key}
            type="button"
            className="etis-cat-active__pill"
            onClick={pill.clear}
            layout
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {pill.label}
            <X size={13} strokeWidth={2.6} />
          </motion.button>
        ))}
      </AnimatePresence>

      {pills.length > 1 && (
        <button type="button" className="etis-cat-active__clear" onClick={reset}>
          Очистить всё
        </button>
      )}
    </div>
  );
}
