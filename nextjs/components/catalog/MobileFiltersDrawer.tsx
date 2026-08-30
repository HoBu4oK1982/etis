"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCatalog } from "./CatalogProvider";

type Props = {
  /** Панель фильтров — та же, что в десктопном сайдбаре */
  children: ReactNode;
  total: number;
};

/**
 * Мобильная шторка фильтров: та же панель, что в сайдбаре,
 * выезжает слева. Пока открыта — блокируем скролл body.
 */
export function MobileFiltersDrawer({ children, total }: Props) {
  const { drawerOpen, setDrawerOpen, reset, hasFilters } = useCatalog();

  useEffect(() => {
    if (!drawerOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, setDrawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="etis-cat-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setDrawerOpen(false)}
          />

          <motion.aside
            className="etis-cat-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="etis-cat-drawer__head">
              <strong>Фильтры</strong>
              <button
                type="button"
                className="etis-cat-drawer__close"
                aria-label="Закрыть фильтры"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="etis-cat-drawer__body" data-lenis-prevent>
              {children}
            </div>

            <div className="etis-cat-drawer__foot">
              <button
                type="button"
                className="is-ghost"
                disabled={!hasFilters}
                onClick={reset}
              >
                Сбросить
              </button>
              <button
                type="button"
                className="is-primary"
                onClick={() => setDrawerOpen(false)}
              >
                Показать {total}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
