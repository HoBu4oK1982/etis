"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./animated-price.css";

type Props = {
  value: number;
  padStart?: number;
  suffix?: string;
  className?: string;
  duration?: number;
};

function formatNumber(value: number, padStart: number, suffix: string) {
  return `${String(Math.round(value)).padStart(padStart, "0")}${suffix}`;
}

/** Количество перелистывается вверх при увеличении и вниз при уменьшении. */
export function AnimatedNumber({
  value,
  padStart = 0,
  suffix = "",
  className = "",
  duration = 0.34,
}: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const incomingRef = useRef<HTMLSpanElement>(null);
  const previousRef = useRef(value);
  const firstRef = useRef(true);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const current = currentRef.current;
    const incoming = incomingRef.current;
    if (!root || !current || !incoming) return;

    const nextText = formatNumber(value, padStart, suffix);

    if (firstRef.current) {
      firstRef.current = false;
      previousRef.current = value;
      current.textContent = nextText;
      incoming.textContent = nextText;
      gsap.set(current, { yPercent: 0, autoAlpha: 1 });
      gsap.set(incoming, { yPercent: 0, autoAlpha: 0 });
      return;
    }

    const previous = previousRef.current;
    if (previous === value) return;
    previousRef.current = value;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.textContent = nextText;
      incoming.textContent = nextText;
      return;
    }

    const direction = value > previous ? 1 : -1;
    current.textContent = formatNumber(previous, padStart, suffix);
    incoming.textContent = nextText;

    gsap.killTweensOf([current, incoming, root]);
    gsap.set(current, { yPercent: 0, autoAlpha: 1, filter: "blur(0px)" });
    gsap.set(incoming, {
      yPercent: direction * 115,
      autoAlpha: 0,
      filter: "blur(2px)",
    });

    const timeline = gsap.timeline({
      defaults: { duration, ease: "power3.out" },
      onComplete: () => {
        current.textContent = nextText;
        gsap.set(current, { yPercent: 0, autoAlpha: 1, filter: "blur(0px)" });
        gsap.set(incoming, { yPercent: 0, autoAlpha: 0, filter: "blur(0px)" });
      },
    });

    timeline.to(
      current,
      { yPercent: direction * -115, autoAlpha: 0, filter: "blur(2px)" },
      0
    );
    timeline.to(
      incoming,
      { yPercent: 0, autoAlpha: 1, filter: "blur(0px)" },
      0
    );
    timeline.fromTo(
      root,
      { scale: 0.92 },
      { scale: 1, duration: 0.28, ease: "back.out(2.2)" },
      0.03
    );

    return () => { timeline.kill(); };
  }, [duration, padStart, suffix, value]);

  const text = formatNumber(value, padStart, suffix);

  return (
    <span
      ref={rootRef}
      className={`etis-animated-value etis-animated-number ${className}`.trim()}
      aria-label={text}
    >
      <span ref={currentRef} className="etis-animated-value__layer">
        {text}
      </span>
      <span
        ref={incomingRef}
        className="etis-animated-value__layer"
        aria-hidden="true"
      >
        {text}
      </span>
    </span>
  );
}
