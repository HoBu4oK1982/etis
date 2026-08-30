"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useCatalog } from "./CatalogProvider";

/**
 * Плавающая кнопка «Фильтрация» — появляется в нижней центральной
 * части экрана, когда пользователь скроллит вниз больше чем на 200px.
 * Живёт только на мобилке / планшете (≤1023px), где сайдбар с фильтрами
 * скрыт. Клик открывает ту же мобильную шторку, что и кнопка в тулбаре.
 *
 * Автоматически рендерится внутри CatalogProvider, поэтому появляется
 * на всех страницах каталога (категории, поиск, hits/sales/news).
 */
export function MobileFilterFab() {
  const { setDrawerOpen, activeCount } = useCatalog();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setVisible(window.scrollY > 200);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button
      type="button"
      className={`etis-cat-filter-fab${visible ? " is-visible" : ""}`}
      onClick={() => setDrawerOpen(true)}
      aria-hidden={!visible}
      aria-label="Открыть фильтры"
      tabIndex={visible ? 0 : -1}
    >
      <SlidersHorizontal size={17} strokeWidth={2.2} />
      Фильтрация
      {activeCount > 0 && <b className="etis-cat-filter-fab__badge">{activeCount}</b>}
    </button>
  );
}
