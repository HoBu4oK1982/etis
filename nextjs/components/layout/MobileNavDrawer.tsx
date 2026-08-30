"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import {
  BadgePercent,
  Flame,
  Heart,
  LayoutGrid,
  Phone,
  Scale,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { CallbackTrigger } from "@/components/callback/CallbackTrigger";
import "./mobile-nav-drawer.css";

type NavItem = {
  href: string;
  label: string;
};

const PRIMARY: NavItem[] = [
  { href: "/brands", label: "Бренды" },
  { href: "/delivery", label: "Доставка и оплата" },
  { href: "/articles", label: "Блог" },
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
];

const PHONE_NUMBER = "+7 (727) 328 05 75";
const PHONE_HREF = "tel:+77273280575";

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLUListElement>(null);
  const closingRef = useRef(false);
  const pathname = usePathname();

  // Закрываем при смене маршрута
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Блокируем прокрутку body пока открыт
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Анимация появления
  useLayoutEffect(() => {
    if (!open) return;
    closingRef.current = false;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (reducedMotion()) {
      gsap.set(overlay, { autoAlpha: 1 });
      gsap.set(panel, { xPercent: 0, autoAlpha: 1 });
      return;
    }

    const tl = gsap.timeline();
    tl.set(overlay, { autoAlpha: 0 })
      .set(panel, { xPercent: 100, autoAlpha: 1 })
      .to(overlay, { autoAlpha: 1, duration: 0.22, ease: "power2.out" })
      .to(
        panel,
        { xPercent: 0, duration: 0.36, ease: "power3.out" },
        "<0.02",
      );

    const items = itemsRef.current?.querySelectorAll("li");
    if (items && items.length) {
      tl.from(
        items,
        {
          x: 30,
          autoAlpha: 0,
          duration: 0.32,
          stagger: 0.04,
          ease: "power3.out",
        },
        "-=0.2",
      );
    }
  }, [open]);

  // Esc для закрытия
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) {
      onClose();
      return;
    }

    if (reducedMotion()) {
      onClose();
      return;
    }

    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panel, { xPercent: 100, duration: 0.28, ease: "power3.in" })
      .to(overlay, { autoAlpha: 0, duration: 0.22, ease: "power2.in" }, "-=0.15");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="etis-mnav__overlay"
      role="presentation"
      onClick={close}
    >
      <aside
        ref={panelRef}
        className="etis-mnav__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="etis-mnav__head">
          <span className="etis-mnav__title">Меню</span>
          <button
            type="button"
            className="etis-mnav__close"
            onClick={close}
            aria-label="Закрыть меню"
          >
            <X size={20} strokeWidth={2.2} />
          </button>
        </header>

        <div className="etis-mnav__scroll">
          <ul ref={itemsRef} className="etis-mnav__list">
            <li>
              <Link
                href="/shop"
                className={`etis-mnav__link etis-mnav__link--catalog${isActive("/shop") ? " is-active" : ""}`}
                onClick={close}
              >
                <span className="etis-mnav__chip etis-mnav__chip--catalog">
                  <LayoutGrid size={17} strokeWidth={2.2} />
                </span>
                Каталог оборудования
              </Link>
            </li>

            <li className="etis-mnav__sep" aria-hidden />

            {PRIMARY.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`etis-mnav__link${isActive(item.href) ? " is-active" : ""}`}
                  onClick={close}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="etis-mnav__sep" aria-hidden />

            <li>
              <Link
                href="/hits"
                className={`etis-mnav__link etis-mnav__link--accent${isActive("/hits") ? " is-active" : ""}`}
                onClick={close}
              >
                <span className="etis-mnav__chip etis-mnav__chip--hit">
                  <Flame size={16} strokeWidth={2.3} />
                </span>
                Хиты продаж
              </Link>
            </li>
            <li>
              <Link
                href="/news"
                className={`etis-mnav__link etis-mnav__link--accent${isActive("/news") ? " is-active" : ""}`}
                onClick={close}
              >
                <span className="etis-mnav__chip etis-mnav__chip--new">
                  <Sparkles size={16} strokeWidth={2.3} />
                </span>
                Новинки
              </Link>
            </li>
            <li>
              <Link
                href="/sales"
                className={`etis-mnav__link etis-mnav__link--accent${isActive("/sales") ? " is-active" : ""}`}
                onClick={close}
              >
                <span className="etis-mnav__chip etis-mnav__chip--sale">
                  <BadgePercent size={16} strokeWidth={2.3} />
                </span>
                Скидки
              </Link>
            </li>

            <li className="etis-mnav__sep" aria-hidden />

            <li>
              <Link
                href="/compare"
                className={`etis-mnav__link etis-mnav__link--util${isActive("/compare") ? " is-active" : ""}`}
                onClick={close}
              >
                <Scale size={17} strokeWidth={2} />
                Сравнение
              </Link>
            </li>
            <li>
              <Link
                href="/favourite"
                className={`etis-mnav__link etis-mnav__link--util${isActive("/favourite") ? " is-active" : ""}`}
                onClick={close}
              >
                <Heart size={17} strokeWidth={2} />
                Избранное
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className={`etis-mnav__link etis-mnav__link--util${isActive("/cart") ? " is-active" : ""}`}
                onClick={close}
              >
                <ShoppingBag size={17} strokeWidth={2} />
                Корзина
              </Link>
            </li>
          </ul>
        </div>

        <footer className="etis-mnav__foot">
          <a href={PHONE_HREF} className="etis-mnav__phone">
            <Phone size={17} strokeWidth={2.2} />
            {PHONE_NUMBER}
          </a>
          <CallbackTrigger
            source="mobile-nav"
            className="etis-mnav__cta"
            aria-label="Заказать обратный звонок"
            onClick={close}
          >
            Перезвоните мне
          </CallbackTrigger>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}
