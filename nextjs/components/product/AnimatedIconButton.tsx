"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Heart, Scale, Check } from "lucide-react";

type Variant = "wishlist" | "compare";

type Props = {
  variant: Variant;
  active: boolean;
  onToggle: () => void;
  /** Компактная (в карточках товаров) / крупная (на странице) */
  size?: "sm" | "md" | "lg";
  /** Подсказка над кнопкой */
  label?: string;
};

/**
 * Круглая иконочная кнопка с GSAP-анимациями:
 *
 *  1. При клике — короткий "прижим" (scale 0.9) и elastic-отскок.
 *  2. Из иконки уходит "ring wave" — расширяющееся полупрозрачное кольцо.
 *  3. При активации разлетаются 6 мини-частиц (сердечки / плюсики), каждая
 *     по своей траектории, затухая.
 *  4. Заливка кнопки плавно перетекает из "off" в "on" (transition CSS-переменной,
 *     чтобы не портить твины scale).
 *
 * Всё замкнуто в gsap.context — при unmount / повторном рендере старые
 * твины убираются, ничего не течёт. Ref-и на DOM — не через любой :any,
 * а через типизированные HTMLDivElement.
 */
export function AnimatedIconButton({
  variant,
  active,
  onToggle,
  size = "md",
  label,
}: Props) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const particlesRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  /*
   * Гидратационный трюк: до окончания монтирования считаем, что кнопка
   * не активна. `active` приходит из Zustand persist-стора (избранное,
   * сравнение) — на сервере такого состояния нет, а на клиенте persist
   * подтягивает его из localStorage синхронно, ещё до первого рендера
   * компонента. Из-за этого сервер отрисовывает `aria-pressed=false`,
   * а клиент — `aria-pressed=true`, и React ругается на mismatch.
   *
   * Ждём эффект (гидратация уже закончилась) и только тогда доверяем
   * реальному `active`. Разница видна пользователю ровно один тик —
   * это меньше глазом заметно, чем красный экран ошибки.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const activeState = mounted && active;

  // Первая отрисовка — не проигрываем анимацию, просто отражаем текущее состояние
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const root = rootRef.current;
    const icon = iconRef.current;
    const ring = ringRef.current;
    const particles = particlesRef.current;
    if (!root || !icon || !ring) return;

    const ctx = gsap.context(() => {
      // 1. Иконка: жмётся и упруго возвращается
      gsap.killTweensOf(icon);
      gsap.timeline()
        .to(icon, { scale: 0.75, duration: 0.12, ease: "power2.in" })
        .to(icon, {
          scale: activeState ? 1.15 : 1,
          duration: 0.55,
          ease: "elastic.out(1.2, 0.45)",
        })
        .to(icon, { scale: 1, duration: 0.2, ease: "power2.out" });

      // 2. Ring wave — только при активации
      if (activeState) {
        gsap.set(ring, { scale: 0.35, opacity: 0.55 });
        gsap.to(ring, {
          scale: 2.1,
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
        });
      }

      // 3. Частицы — только при активации
      if (activeState && particles) {
        const children = Array.from(particles.children) as HTMLElement[];
        children.forEach((el, i) => {
          const angle = (Math.PI * 2 * i) / children.length - Math.PI / 2;
          const dist = 42 + Math.random() * 14;
          gsap.set(el, { x: 0, y: 0, scale: 0, opacity: 1 });
          gsap
            .timeline()
            .to(el, {
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: 1,
              duration: 0.45,
              ease: "power2.out",
            })
            .to(
              el,
              {
                opacity: 0,
                scale: 0.4,
                y: `+=${18 + Math.random() * 8}`,
                duration: 0.35,
                ease: "power1.in",
              },
              "-=0.15"
            );
        });
      }
    }, root);

    return () => ctx.revert();
  }, [activeState]);

  const dims = size === "sm" ? 36 : size === "lg" ? 52 : 44;
  const iconSize = size === "sm" ? 16 : size === "lg" ? 22 : 19;
  const Icon = variant === "wishlist" ? Heart : Scale;

  const ariaLabel = label
    ? label
    : variant === "wishlist"
    ? activeState
      ? "Убрать из избранного"
      : "В избранное"
    : activeState
    ? "Убрать из сравнения"
    : "Сравнить";

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      aria-label={ariaLabel}
      aria-pressed={activeState}
      data-active={activeState ? "true" : "false"}
      data-variant={variant}
      className="etis-icon-btn"
      style={{ width: dims, height: dims }}
    >
      {/* Ring — расходящаяся волна при активации */}
      <span ref={ringRef} className="etis-icon-btn__ring" aria-hidden />

      {/* Частицы — маленькие символы, разлетающиеся при активации */}
      <span ref={particlesRef} className="etis-icon-btn__particles" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="etis-icon-btn__particle">
            {variant === "wishlist" ? (
              <Heart size={10} fill="currentColor" strokeWidth={0} />
            ) : (
              <Check size={10} strokeWidth={3} />
            )}
          </span>
        ))}
      </span>

      {/* Сама иконка */}
      <span ref={iconRef} className="etis-icon-btn__icon">
        <Icon
          size={iconSize}
          fill={activeState && variant === "wishlist" ? "currentColor" : "none"}
          strokeWidth={variant === "compare" ? 2 : 2}
        />
      </span>

      {/* Тултип */}
      {label && (
        <span
          className="etis-icon-btn__tooltip"
          data-visible={showTooltip ? "true" : "false"}
        >
          {label}
        </span>
      )}
    </button>
  );
}
