"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

type Props = {
  children: ReactNode;
  /** Длительность оборота, сек */
  duration?: number;
  /** Направление: 1 — по часовой, -1 — против */
  direction?: 1 | -1;
  className?: string;
};

/**
 * Оборачивает иконку и крутит её на 360° вокруг вертикальной оси
 * при наведении на ближайшую ссылку/кнопку.
 *
 * Триггер ищется через closest("a, button") — поэтому компонент можно
 * ставить в любую шапку без правки разметки: анимация запускается от
 * наведения на всю ссылку целиком, а не на саму иконку.
 *
 * Повторный вход курсора во время анимации её не перезапускает —
 * иначе при дрожании мыши иконка дёргается.
 */
export function SpinOnHover({
  children,
  duration = 0.75,
  direction = 1,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const trigger: Element = el.closest("a, button") ?? el;
    let tween: gsap.core.Tween | null = null;

    const onEnter = () => {
      if (tween?.isActive()) return;

      tween = gsap.fromTo(
        el,
        { rotationY: 0 },
        {
          rotationY: 360 * direction,
          duration,
          ease: "power2.inOut",
          transformPerspective: 600,
          transformOrigin: "50% 50%",
          onComplete: () => gsap.set(el, { rotationY: 0 }),
        }
      );
    };

    trigger.addEventListener("mouseenter", onEnter);

    return () => {
      trigger.removeEventListener("mouseenter", onEnter);
      tween?.kill();
      gsap.set(el, { clearProps: "transform" });
    };
  }, [duration, direction]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-flex", transformStyle: "preserve-3d" }}
    >
      {children}
    </span>
  );
}
