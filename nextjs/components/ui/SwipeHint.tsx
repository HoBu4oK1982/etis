"use client";

import { Pointer } from "lucide-react";

/**
 * Мобильная подсказка «свайпни карточки».
 *
 * Показывается как круглая синяя пилюля с указательным пальцем.
 * Пилюля висит поверх карточек с горизонтальным скроллом
 * (популярное, акции, новинки, hero-категории).
 *
 * По умолчанию скрыта на десктопе (класс md:hidden + отдельное
 * правило в globals.css с !important — Tailwind-утилита одна против
 * одной с базовым стилем не всегда выигрывает без явного форсинга).
 */
export function SwipeHint({ className = "" }: { className?: string }) {
  return (
    <span
      className={`etis-swipe-hint md:hidden ${className}`}
      aria-hidden="true"
      title="Свайпните карточки"
    >
      <Pointer size={19} strokeWidth={2} />
    </span>
  );
}
