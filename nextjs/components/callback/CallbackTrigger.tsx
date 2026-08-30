"use client";

import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type PointerEvent,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import { openEtisCallback } from "./callback-events";
import styles from "./CallbackWidget.module.css";

type CallbackTriggerProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "type"
> & {
  source?: string;
};

/**
 * Универсальная кнопка открытия callback-модалки.
 * Сохраняет переданные классы шапки, но добавляет лёгкий GSAP hover/click
 * и фирменный световой проход.
 */
export function CallbackTrigger({
  source = "site",
  className = "",
  children,
  onPointerEnter,
  onPointerLeave,
  onClick,
  ...props
}: CallbackTriggerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    return () => {
      if (buttonRef.current) gsap.killTweensOf(buttonRef.current);
    };
  }, []);

  const handlePointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerEnter?.(event);
    const button = buttonRef.current;
    if (!button || reducedMotionRef.current) return;

    gsap.killTweensOf(button);
    gsap.to(button, {
      y: -2,
      scale: 1.025,
      duration: 0.24,
      ease: "power2.out",
    });
  };

  const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(event);
    const button = buttonRef.current;
    if (!button || reducedMotionRef.current) return;

    gsap.killTweensOf(button);
    gsap.to(button, {
      y: 0,
      scale: 1,
      duration: 0.28,
      ease: "power3.out",
    });
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const button = buttonRef.current;
    if (button && !reducedMotionRef.current) {
      gsap.killTweensOf(button);
      gsap
        .timeline()
        .to(button, { scale: 0.96, duration: 0.09, ease: "power2.in" })
        .to(button, { scale: 1, y: 0, duration: 0.22, ease: "back.out(2.6)" });
    }

    openEtisCallback(source);
  };

  return (
    <button
      {...props}
      ref={buttonRef}
      type="button"
      className={`${styles.callbackTrigger} ${className}`.trim()}
      data-etis-callback-trigger
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <span className={styles.callbackTriggerSheen} aria-hidden="true" />
      {children}
    </button>
  );
}
