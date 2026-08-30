"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type Props = {
  label?: string;
  /** Открыто ли мега-меню — от этого зависит морф бургера в крестик */
  open: boolean;
  onToggle: () => void;
};

const BASE_SCALES = [1, 0.62, 0.82];

/**
 * Кнопка «Каталог» — переключатель мега-меню.
 *
 * GSAP отвечает за всё поведение:
 *  - магнит: кнопка тянется за курсором (±6px), возврат — elastic;
 *  - блик: полоса пробегает по кнопке на входе курсора;
 *  - бургер: полоски по очереди дотягиваются до полной ширины,
 *    а при открытом меню складываются в крестик;
 *  - клик: волна от точки нажатия + короткое «вдавливание».
 */
export function CatalogButton({ label = "Каталог", open, onToggle }: Props) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const linesRef = useRef<HTMLElement[]>([]);
  const openRef = useRef(open);

  openRef.current = open;

  /* ---------- Наведение, магнит, клик ---------- */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const inner = innerRef.current;
      const sheen = sheenRef.current;
      const ripple = rippleRef.current;
      const lines = linesRef.current.filter(Boolean);

      const moveX = gsap.quickTo(root, "x", { duration: 0.45, ease: "power3" });
      const moveY = gsap.quickTo(root, "y", { duration: 0.45, ease: "power3" });
      const innerX = gsap.quickTo(inner, "x", { duration: 0.55, ease: "power3" });

      let sheenTween: gsap.core.Tween | null = null;

      const onEnter = () => {
        gsap.to(root, { scale: 1.035, duration: 0.4, ease: "power3.out" });

        if (sheen) {
          sheenTween?.kill();
          sheenTween = gsap.fromTo(
            sheen,
            { xPercent: -180, opacity: 0 },
            {
              xPercent: 260,
              opacity: 1,
              duration: 0.85,
              ease: "power2.inOut",
              onComplete: () => gsap.set(sheen, { opacity: 0 }),
            }
          );
        }

        // Пока меню открыто, полоски держат крестик — не трогаем
        if (openRef.current) return;

        gsap.to(lines, {
          scaleX: 1,
          duration: 0.34,
          ease: "power3.out",
          stagger: 0.06,
        });
      };

      const onLeave = () => {
        moveX(0);
        moveY(0);
        innerX(0);

        gsap.to(root, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.55)" });

        if (openRef.current) return;

        gsap.to(lines, {
          scaleX: (i: number) => BASE_SCALES[i] ?? 1,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.04,
        });
      };

      const onMove = (e: MouseEvent) => {
        const r = root.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);

        moveX(gsap.utils.clamp(-6, 6, dx * 0.14));
        moveY(gsap.utils.clamp(-4, 4, dy * 0.2));
        innerX(gsap.utils.clamp(-3, 3, dx * 0.06));
      };

      const onDown = (e: PointerEvent) => {
        gsap.to(root, { scale: 0.965, duration: 0.14, ease: "power2.out" });

        if (!ripple) return;
        const r = root.getBoundingClientRect();

        gsap.set(ripple, {
          left: e.clientX - r.left,
          top: e.clientY - r.top,
          scale: 0,
          opacity: 0.5,
        });
        gsap.to(ripple, {
          scale: (Math.max(r.width, r.height) / 14) * 2.4,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
        });
      };

      const onUp = () => {
        gsap.to(root, { scale: 1.035, duration: 0.28, ease: "back.out(2.4)" });
      };

      gsap.set(lines, { transformOrigin: "left center" });
      gsap.set(lines, { scaleX: (i: number) => BASE_SCALES[i] ?? 1 });

      root.addEventListener("mouseenter", onEnter);
      root.addEventListener("mouseleave", onLeave);
      root.addEventListener("mousemove", onMove);
      root.addEventListener("pointerdown", onDown);
      root.addEventListener("pointerup", onUp);

      return () => {
        root.removeEventListener("mouseenter", onEnter);
        root.removeEventListener("mouseleave", onLeave);
        root.removeEventListener("mousemove", onMove);
        root.removeEventListener("pointerdown", onDown);
        root.removeEventListener("pointerup", onUp);
      };
    }, rootRef);

    return () => ctx.revert();
  }, []);

  /* ---------- Морф бургера в крестик ---------- */

  useEffect(() => {
    const lines = linesRef.current.filter(Boolean);
    if (lines.length < 3) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(lines, { clearProps: "all" });
      return;
    }

    const tl = gsap.timeline({ defaults: { duration: 0.34, ease: "power3.inOut" } });

    if (open) {
      // Для настоящего крестика обе линии должны вращаться вокруг центра.
      // При transformOrigin: left center они сходились одним концом и
      // визуально превращались в угол/стрелку.
      tl.set(lines, { transformOrigin: "50% 50%" }, 0)
        .to(lines, { scaleX: 1, duration: 0.2 }, 0)
        .to(lines[1], { opacity: 0, scaleX: 0.2, duration: 0.2 }, 0)
        .to(lines[0], { y: 6, rotate: 45 }, 0.08)
        .to(lines[2], { y: -6, rotate: -45 }, 0.08);
    } else {
      tl.to([lines[0], lines[2]], { y: 0, rotate: 0 }, 0)
        .to(lines[1], { opacity: 1, scaleX: BASE_SCALES[1], duration: 0.22 }, 0.12)
        .set(lines, { transformOrigin: "left center" }, 0.12)
        .to(
          lines,
          {
            scaleX: (i: number) => BASE_SCALES[i] ?? 1,
            duration: 0.28,
            stagger: 0.03,
          },
          0.1
        );
    }

    return () => {
      tl.kill();
    };
  }, [open]);

  return (
    <button
      ref={rootRef}
      type="button"
      className={`etis-nav__catalog${open ? " is-open" : ""}`}
      aria-expanded={open}
      aria-haspopup="true"
      onClick={onToggle}
    >
      <span ref={sheenRef} className="etis-nav__catalog-sheen" aria-hidden />
      <span ref={rippleRef} className="etis-nav__catalog-ripple" aria-hidden />

      <span ref={innerRef} className="etis-nav__catalog-inner">
        <span className="etis-nav__burger" aria-hidden>
          {[0, 1, 2].map((i) => (
            <i
              key={i}
              ref={(el) => {
                if (el) linesRef.current[i] = el;
              }}
            />
          ))}
        </span>
        {label}
      </span>
    </button>
  );
}
