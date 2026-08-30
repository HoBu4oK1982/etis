"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { CategoryTile } from "@/lib/types/catalog";
import { useCatalog } from "./CatalogProvider";

/**
 * Фильтр по категориям: корневые категории + второй уровень.
 * Глубже трёх уровней в каталоге не спускаемся — для этого
 * есть отдельные SEO-страницы /category/{slug}/{path*}.
 */
export function FilterCategories({ categories }: { categories: CategoryTile[] }) {
  const { params, update } = useCatalog();

  // Раскрытым держим тот корень, внутри которого выбрана подкатегория
  const initiallyOpen = categories
    .filter(
      (c) =>
        c.slug === params.category ||
        c.children.some((ch) => ch.slug === params.category)
    )
    .map((c) => c.id);

  const [openIds, setOpenIds] = useState<number[]>(initiallyOpen);

  const toggleOpen = (id: number) =>
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  const select = (slug: string) => {
    update({ category: params.category === slug ? undefined : slug });
  };

  if (categories.length === 0) {
    return <p className="etis-cat-empty-note">Категории не найдены</p>;
  }

  return (
    <div className="etis-cat-tree">
      <div className="etis-cat-tree__row">
        <button
          type="button"
          className={`etis-cat-tree__item${!params.category ? " is-active" : ""}`}
          onClick={() => update({ category: undefined })}
        >
          <span>Все категории</span>
        </button>
      </div>

      {categories.map((cat) => {
        const isOpen = openIds.includes(cat.id);
        const isActive = params.category === cat.slug;

        return (
          <div key={cat.id}>
            <div className="etis-cat-tree__row">
              <button
                type="button"
                className={`etis-cat-tree__item${isActive ? " is-active" : ""}`}
                onClick={() => select(cat.slug)}
              >
                <span>{cat.title}</span>
                <span className="etis-cat-tree__num">{cat.products_count}</span>
              </button>

              {cat.children.length > 0 && (
                <button
                  type="button"
                  className={`etis-cat-tree__toggle${isOpen ? " is-open" : ""}`}
                  aria-label={isOpen ? "Свернуть" : "Развернуть"}
                  onClick={() => toggleOpen(cat.id)}
                >
                  <ChevronRight size={15} strokeWidth={2.4} />
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {isOpen && cat.children.length > 0 && (
                <motion.div
                  className="etis-cat-tree__children"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  {cat.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={`etis-cat-tree__item${
                        params.category === child.slug ? " is-active" : ""
                      }`}
                      onClick={() => select(child.slug)}
                    >
                      <span>{child.title}</span>
                      <span className="etis-cat-tree__num">{child.products_count}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
