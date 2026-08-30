import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import "./breadcrumbs.css";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Хлебные крошки. Последний элемент — текущая страница (без href).
 * Первый пункт с href="/" автоматически отображается красивой иконкой дома.
 *
 * Цвета берутся из семантических переменных темы (--text, --text-muted,
 * --border, --accent, --surface) вместо сырых ink-500/ink-300 — этих
 * токенов вообще не было в @theme, и в тёмном режиме крошки выглядели
 * нечитаемо (текст без цвета, кнопка дома светлая на тёмном фоне).
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Хлебные крошки" className="etis-crumbs">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const isHome = i === 0 && item.href === "/";

        return (
          <div key={`${item.label}-${i}`} className="etis-crumbs__item">
            {i > 0 && (
              <ChevronRight
                size={14}
                strokeWidth={2}
                className="etis-crumbs__sep"
                aria-hidden="true"
              />
            )}

            {item.href && !isLast ? (
              isHome ? (
                <Link
                  href={item.href}
                  aria-label={item.label}
                  title={item.label}
                  className="etis-crumbs__home"
                >
                  <House size={15} strokeWidth={2.25} aria-hidden="true" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              ) : (
                <Link
                  href={item.href}
                  className="etis-crumbs__link"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )
            ) : (
              <span
                className="etis-crumbs__current"
                title={item.label}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
