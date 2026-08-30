"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Sparkles, BadgePercent } from "lucide-react";
import type { CategoryTreeNode } from "@/lib/types/category";
import { CatalogButton } from "./CatalogButton";
import { CatalogMegaMenu } from "./CatalogMegaMenu";
import "@/components/product/product-detail.css";
import "./header-nav.css";

type NavItem = {
  href: string;
  label: string;
};

type PillTone = "active" | "hover";

/** Пункты меню (без «Каталога» — он открывает мега-меню). */
const LEFT_ITEMS: NavItem[] = [
  { href: "/brands", label: "Бренды" },
  { href: "/delivery", label: "Доставка и оплата" },
  { href: "/articles", label: "Блог" },
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
];

export function HeaderNav({ categories = [] }: { categories?: CategoryTreeNode[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const hoveredLinkRef = useRef<HTMLElement | null>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const movePill = useCallback(
    (target: HTMLElement | null, tone: PillTone, instant = false) => {
      const nav = navRef.current;
      const pill = pillRef.current;
      if (!nav || !pill) return;

      if (!target) {
        pill.classList.remove("is-visible", "is-hover", "is-active");
        nav.classList.remove("has-floating-pill");
        return;
      }

      const navRect = nav.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const left = targetRect.left - navRect.left + nav.scrollLeft;
      const top = targetRect.top - navRect.top + nav.scrollTop;

      if (instant) pill.classList.add("is-instant");

      pill.style.setProperty("--pill-x", `${left}px`);
      pill.style.setProperty("--pill-y", `${top}px`);
      pill.style.setProperty("--pill-width", `${targetRect.width}px`);
      pill.style.setProperty("--pill-height", `${targetRect.height}px`);
      pill.classList.toggle("is-hover", tone === "hover");
      pill.classList.toggle("is-active", tone === "active");
      pill.classList.add("is-visible");
      nav.classList.add("has-floating-pill");

      if (instant) {
        requestAnimationFrame(() => pill.classList.remove("is-instant"));
      }
    },
    []
  );

  const restoreActivePill = useCallback(
    (instant = false) => {
      const activeLink = navRef.current?.querySelector<HTMLElement>(
        ".etis-nav__link.is-active"
      );
      movePill(activeLink ?? null, "active", instant);
    },
    [movePill]
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => restoreActivePill(true));

    const onResize = () => {
      if (hoveredLinkRef.current) {
        movePill(hoveredLinkRef.current, "hover", true);
        return;
      }
      restoreActivePill(true);
    };

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [pathname, movePill, restoreActivePill]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;

    const link = (event.target as HTMLElement).closest<HTMLElement>(
      ".etis-nav__link"
    );

    if (!link || !event.currentTarget.contains(link) || link === hoveredLinkRef.current) {
      return;
    }

    hoveredLinkRef.current = link;
    movePill(link, "hover");
  };

  const handlePointerLeave = () => {
    hoveredLinkRef.current = null;
    restoreActivePill();
  };

  return (
    // position: relative нужен, чтобы панель мега-меню позиционировалась
    // от полосы навигации, а не от вьюпорта
    <div className="etis-nav">
      <nav
        ref={navRef}
        className="container-narrow etis-nav__inner scrollbar-none"
        aria-label="Главное меню"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <span ref={pillRef} className="etis-nav__hover-pill" aria-hidden />

        {/* Каталог — кнопка-переключатель мега-меню */}
        <CatalogButton
          label="Каталог"
          open={menuOpen}
          onToggle={() => setMenuOpen((v) => !v)}
        />

        {/* Основные разделы */}
        <ul className="etis-nav__list etis-nav__list--main">
          {LEFT_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`etis-nav__link${isActive(item.href) ? " is-active" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Подборки — иконка в цветном чипе */}
        <ul className="etis-nav__list etis-nav__list--right">
          <li>
            <AccentLink
              href="/hits"
              label="Хиты продаж"
              chipClass="etis-nav__chip--hit"
              icon={<Flame size={18} strokeWidth={2.3} />}
              active={isActive("/hits")}
            />
          </li>
          <li>
            <AccentLink
              href="/news"
              label="Новинки"
              chipClass="etis-nav__chip--new"
              icon={<Sparkles size={18} strokeWidth={2.3} />}
              active={isActive("/news")}
            />
          </li>
          <li>
            <AccentLink
              href="/sales"
              label="Скидки"
              chipClass="etis-nav__chip--sale"
              icon={<BadgePercent size={18} strokeWidth={2.3} />}
              active={isActive("/sales")}
            />
          </li>
        </ul>
      </nav>

      {/* Панель вынесена из .etis-nav__inner: у контейнера overflow-x,
          внутри него выпадашка обрезалась бы по высоте */}
      <CatalogMegaMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
      />
    </div>
  );
}

/* ---------- Внутренние компоненты ---------- */

function AccentLink({
  href,
  icon,
  chipClass,
  label,
  active,
}: {
  href: string;
  icon: ReactNode;
  chipClass: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`etis-nav__link etis-nav__link--accent${active ? " is-active" : ""}`}
    >
      <span className={`etis-nav__chip ${chipClass}`}>{icon}</span>
      {label}
    </Link>
  );
}
