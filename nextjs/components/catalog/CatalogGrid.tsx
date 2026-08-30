"use client";

import { motion } from "framer-motion";
import type { ProductListItem } from "@/lib/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { useCatalog } from "./CatalogProvider";
import { CatalogEmpty } from "./CatalogEmpty";

/**
 * Сетка результатов.
 *
 * key на motion.div собирается из активных параметров — при смене фильтра
 * сетка перемонтируется и заново проигрывает stagger-появление карточек.
 * Пока идёт навигация (isPending) сетка гасится, поверх — лоадер.
 */
export function CatalogGrid({ products }: { products: ProductListItem[] }) {
  const { params, isPending } = useCatalog();

  if (products.length === 0 && !isPending) {
    return <CatalogEmpty />;
  }

  const animationKey = [
    params.category ?? "-",
    params.brands.join("."),
    params.remark ?? "-",
    params.price_from ?? "-",
    params.price_to ?? "-",
    params.sort,
    params.page,
    params.per_page,
    params.view,
  ].join("|");

  return (
    <div className="etis-cat-grid-wrap">
      {isPending && (
        <div className="etis-cat-grid-loader">
          <span className="etis-cat-spinner" />
          Обновляем подборку
        </div>
      )}

      <motion.div
        key={animationKey}
        className={`etis-cat-grid${params.view === "compact" ? " etis-cat-grid--list" : ""}${
          isPending ? " is-pending" : ""
        }`}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } },
        }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="etis-cat-grid__item"
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <ProductCard
              product={product}
              layout={params.view === "compact" ? "list" : "grid"}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
