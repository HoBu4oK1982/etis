"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { formatPrice } from "@/lib/utils/price";
import "./animated-price.css";

type Props = {
  value: number;
  className?: string;
  duration?: number;
  ariaLabel?: string;
};

/**
 * Плавный числовой пересчёт цены.
 * Значение не перелистывается целиком: GSAP реально проходит числа
 * между предыдущей и новой суммой, например 500 → 546 → 681 → 1000.
 */
export function AnimatedPrice({
  value,
  className = "",
  duration = 0.68,
  ariaLabel,
}: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const displayedRef = useRef(Number.isFinite(value) ? value : 0);
  const firstRef = useRef(true);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    if (!root || !text) return;

    const target = Number.isFinite(value) ? value : 0;

    if (firstRef.current) {
      firstRef.current = false;
      displayedRef.current = target;
      text.textContent = formatPrice(Math.round(target));
      return;
    }

    const start = displayedRef.current;
    if (Math.round(start) === Math.round(target)) {
      displayedRef.current = target;
      text.textContent = formatPrice(Math.round(target));
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      displayedRef.current = target;
      text.textContent = formatPrice(Math.round(target));
      return;
    }

    const counter = { value: start };
    const difference = Math.abs(target - start);
    const resolvedDuration = Math.min(
      0.95,
      Math.max(duration, 0.48 + Math.log10(difference + 10) * 0.055)
    );

    gsap.killTweensOf(root);

    const tween = gsap.to(counter, {
      value: target,
      duration: resolvedDuration,
      ease: "power2.out",
      overwrite: true,
      onStart: () => {
        gsap.fromTo(
          root,
          { scale: 1.018 },
          { scale: 1, duration: 0.28, ease: "power2.out", overwrite: true }
        );
      },
      onUpdate: () => {
        displayedRef.current = counter.value;
        text.textContent = formatPrice(Math.round(counter.value));
      },
      onComplete: () => {
        displayedRef.current = target;
        text.textContent = formatPrice(Math.round(target));
      },
    });

    return () => { tween.kill(); };
  }, [duration, value]);

  const text = formatPrice(Math.round(Number.isFinite(value) ? value : 0));

  return (
    <span
      ref={rootRef}
      className={`etis-animated-value ${className}`.trim()}
      aria-label={ariaLabel ?? text}
      aria-live="polite"
    >
      <span ref={textRef} className="etis-animated-value__layer">
        {text}
      </span>
    </span>
  );
}
