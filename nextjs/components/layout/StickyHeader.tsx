"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import {
  Heart,
  Menu,
  Scale,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { SpinOnHover } from "@/components/ui/SpinOnHover";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCart } from "@/lib/stores/cart";
import { useCompare } from "@/lib/stores/compare";
import { useWishlist } from "@/lib/stores/wishlist";
import type { CategoryTreeNode } from "@/lib/types/category";
import MobileSearchOverlay from "@/components/search/MobileSearchOverlay";
import { CallbackTrigger } from "@/components/callback/CallbackTrigger";
import { CatalogMegaMenu } from "./CatalogMegaMenu";
import "./sticky-header.css";

export function StickyHeader({ categories = [] }: { categories?: CategoryTreeNode[] }) {
  const headerRef = useRef<HTMLElement>(null);
  const lastYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const overlayOpenRef = useRef(false);
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const totalQty = useCart((state) => state.totalQty());
  const wishlistQty = useWishlist((state) => state.count());
  const compareQty = useCompare((state) => state.count());

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    gsap.set(header, { y: -110, autoAlpha: 0 });

    const SHOW_AFTER = 220;
    const HIDE_DELTA = 8;

    const show = () => {
      if (visibleRef.current) return;
      visibleRef.current = true;
      gsap.to(header, {
        y: 0,
        autoAlpha: 1,
        duration: 0.46,
        ease: "power3.out",
        overwrite: true,
      });
    };

    const hide = () => {
      if (!visibleRef.current || overlayOpenRef.current) return;
      visibleRef.current = false;
      gsap.to(header, {
        y: -110,
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.in",
        overwrite: true,
      });
    };

    const tick = () => {
      rafRef.current = null;
      const y = window.scrollY;
      const delta = y - lastYRef.current;

      if (overlayOpenRef.current) {
        show();
      } else if (y < SHOW_AFTER) {
        hide();
      } else if (delta > HIDE_DELTA) {
        hide();
      } else if (delta < -HIDE_DELTA) {
        show();
      }

      lastYRef.current = y;
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(tick);
    };

    lastYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      gsap.killTweensOf(header);
    };
  }, []);

  useEffect(() => {
    overlayOpenRef.current = catalogOpen || searchOpen;
    const header = headerRef.current;
    if (!header || !overlayOpenRef.current) return;

    visibleRef.current = true;
    gsap.to(header, {
      y: 0,
      autoAlpha: 1,
      duration: 0.28,
      ease: "power3.out",
      overwrite: true,
    });
  }, [catalogOpen, searchOpen]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    setSearchOpen(false);
    setCatalogOpen(false);
    gsap.killTweensOf(header);
    gsap.set(header, { y: -110, autoAlpha: 0 });
    visibleRef.current = false;
    lastYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
  }, [pathname]);

  const openSearch = () => {
    setCatalogOpen(false);
    setSearchOpen(true);
  };

  const toggleCatalog = () => {
    setSearchOpen(false);
    setCatalogOpen((value) => !value);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="sticky-header"
        aria-label="Быстрая навигация"
      >
        <div className="container-narrow sticky-header__shell">
          <Link href="/" className="sticky-header__logo" aria-label="На главную">
            <Logo size={42} />
          </Link>

          <nav className="sticky-header__nav" aria-label="Быстрое меню">
            <button
              type="button"
              className={`sticky-header__catalogBtn${catalogOpen ? " is-open" : ""}`}
              onClick={toggleCatalog}
              aria-expanded={catalogOpen}
              aria-controls="sticky-catalog-menu"
              data-catalog-trigger
            >
              <span className="sticky-header__catalogIcon" aria-hidden>
                {catalogOpen ? <X size={19} /> : <Menu size={19} />}
              </span>
              <span>Каталог</span>
            </button>

            <Link href="/brands" className="sticky-header__link">Бренды</Link>
            <Link href="/delivery" className="sticky-header__link sticky-header__link--wide">
              Доставка и оплата
            </Link>
            <Link href="/articles" className="sticky-header__link">Блог</Link>
            <Link href="/about" className="sticky-header__link sticky-header__link--optional">О нас</Link>
            <Link href="/contacts" className="sticky-header__link">Контакты</Link>
          </nav>

          <div className="sticky-header__actions">
            <ActionButton label="Поиск" onClick={openSearch}>
              <Search size={21} />
            </ActionButton>

            <ActionLink href="/compare" label="Сравнение" count={mounted ? compareQty : 0} tone="blue">
              <Scale size={21} />
            </ActionLink>

            <ActionLink href="/favourite" label="Избранное" count={mounted ? wishlistQty : 0} tone="orange">
              <Heart size={21} />
            </ActionLink>

            <ActionLink
              href="/cart"
              label="Корзина"
              count={mounted ? totalQty : 0}
              tone="green"
              cartTarget
            >
              <ShoppingBag size={21} />
            </ActionLink>

            <span className="sticky-header__divider" aria-hidden />

            <span className="sticky-header__theme">
              <ThemeToggle />
            </span>

            <CallbackTrigger
              source="sticky-header"
              className="sticky-header__cta"
              aria-label="Заказать обратный звонок"
            >
              <span>Перезвоните мне</span>
            </CallbackTrigger>
          </div>
        </div>

        <div id="sticky-catalog-menu">
          <CatalogMegaMenu
            open={catalogOpen}
            onClose={() => setCatalogOpen(false)}
            categories={categories}
            variant="sticky"
          />
        </div>
      </header>

      {searchOpen && (
        <MobileSearchOverlay
          placeholder="Найдите котёл, насос, горелку или оборудование"
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}

function ActionButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="sticky-header__action"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <SpinOnHover>{children}</SpinOnHover>
      <span className="sticky-header__actionLabel">{label}</span>
    </button>
  );
}

function ActionLink({
  href,
  children,
  label,
  count,
  tone,
  cartTarget = false,
}: {
  href: string;
  children: ReactNode;
  label: string;
  count: number;
  tone: "blue" | "orange" | "green";
  cartTarget?: boolean;
}) {
  return (
    <Link
      href={href}
      className="sticky-header__action"
      aria-label={count > 0 ? `${label}: ${count}` : label}
      title={label}
      data-cart-target={cartTarget ? "" : undefined}
    >
      <span className="sticky-header__actionIcon">
        <SpinOnHover>{children}</SpinOnHover>
        {count > 0 && (
          <span className={`sticky-header__badge sticky-header__badge--${tone}`}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="sticky-header__actionLabel">{label}</span>
    </Link>
  );
}
