"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";

/**
 * Провайдер плавного скролла на базе Lenis.
 *
 * - Root-режим: скроллит документ (не отдельный контейнер).
 * - Не убирает нативные скроллбары — они стилизуются в scrollbars.css.
 * - Уважает prefers-reduced-motion: при включённом флаге не запускается.
 * - Перехватывает клики по внутренним якорям (<a href="#...">) и плавно
 *   докручивает до элемента через lenis.scrollTo().
 *
 * Как исключить участок из smooth-скролла (например, внутренний скролл
 * модалки/дропдауна):
 *   <div data-lenis-prevent>…</div>
 *
 * Доступ к инстансу Lenis из компонентов:
 *   const lenis = useLenis();
 *   lenis?.scrollTo("#pricing", { offset: -80 });
 */

const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const instance = new Lenis({
      duration: 1.15,
      // Плавная интерполяция позиции
      lerp: 0.09,
      // Плавный ease-out (стандартная кривая Lenis)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Гладкое колесо мыши
      smoothWheel: true,
      // На тач-устройствах оставляем нативный инерционный скролл
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    setLenis(instance);

    // RAF-цикл
    let rafId = 0;
    const tick = (time: number) => {
      instance.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Якорные ссылки: <a href="#target"> — плавный переход через Lenis
    const onAnchorClick = (e: MouseEvent) => {
      // Пропускаем клики с модификаторами (открытие в новой вкладке и т.п.)
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      // Пропускаем ссылки с data-lenis-prevent на самой ссылке
      if (anchor.dataset.lenisPrevent !== undefined) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      instance.scrollTo(target as HTMLElement, { offset: -20 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onAnchorClick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
