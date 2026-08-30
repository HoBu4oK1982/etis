"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Search, Sparkles, X } from "lucide-react";
import SmartSearch from "./SmartSearch";
import "./mobileSearchOverlay.css";

/**
 * Единый полноэкранный поиск для обычной и прилипающей шапок.
 * Механика похожа на TGR Market: затемнение, крупная карточка,
 * автофокус и живые результаты, но визуально полностью в стиле ETIS.KZ.
 */
export default function MobileSearchOverlay({
  placeholder = "Что вы ищете?",
  onClose,
}: {
  placeholder?: string;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;

    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(cardRef.current, {
      y: -22,
      scale: 0.975,
      autoAlpha: 0,
      duration: 0.24,
      ease: "power3.in",
    }).to(
      overlayRef.current,
      { autoAlpha: 0, duration: 0.25, ease: "power2.in" },
      "-=0.14",
    );
  };

  useEffect(() => {
    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("lenis:toggle", { detail: { stop: true } }));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(cardRef.current, { y: reduced ? 0 : -30, scale: reduced ? 1 : 0.965, autoAlpha: 0 });

      gsap.timeline()
        .to(overlayRef.current, { autoAlpha: 1, duration: reduced ? 0 : 0.24, ease: "power2.out" })
        .to(cardRef.current, {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: reduced ? 0 : 0.46,
          ease: "power4.out",
        }, "-=0.12")
        .fromTo(
          ".mSearch__feature",
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.05, duration: reduced ? 0 : 0.3, ease: "power2.out" },
          "-=0.18",
        );
    }, overlayRef);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const focusTimer = window.setTimeout(() => {
      overlayRef.current?.querySelector<HTMLInputElement>(".ss__input")?.focus();
    }, reduced ? 0 : 280);

    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.dispatchEvent(new CustomEvent("lenis:toggle", { detail: { stop: false } }));
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="mSearch" ref={overlayRef} role="presentation">
      <button
        type="button"
        className="mSearch__backdrop"
        onClick={close}
        aria-label="Закрыть поиск"
      />

      <section
        className="mSearch__card"
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Поиск по каталогу ETIS.KZ"
      >
        <div className="mSearch__accent" aria-hidden />

        <header className="mSearch__head">
          <div className="mSearch__heading">
            <span className="mSearch__eyebrow">
              <Sparkles size={14} /> Быстрый поиск ETIS.KZ
            </span>
            <h2>Найдём оборудование за несколько секунд</h2>
            <p>Начните вводить название, бренд, категорию или характеристику.</p>
          </div>

          <button type="button" className="mSearch__close" onClick={close} aria-label="Закрыть поиск">
            <X size={22} />
          </button>
        </header>

        <div className="mSearch__searchWrap">
          <span className="mSearch__largeIcon" aria-hidden>
            <Search size={26} />
          </span>
          <div className="mSearch__body">
            <SmartSearch placeholder={placeholder} onNavigate={close} />
          </div>
        </div>

        <div className="mSearch__features">
          <div className="mSearch__feature">
            <strong>Умные подсказки</strong>
            <span>Исправляем раскладку и опечатки</span>
          </div>
          <div className="mSearch__feature">
            <strong>Живые результаты</strong>
            <span>Товары, категории и бренды сразу</span>
          </div>
          <div className="mSearch__feature">
            <strong>Инженерный подбор</strong>
            <span>Не нашли — поможем подобрать аналог</span>
          </div>
        </div>

        <footer className="mSearch__hint">
          Для закрытия нажмите <kbd>Esc</kbd> или кликните вне окна
        </footer>
      </section>
    </div>,
    document.body,
  );
}
