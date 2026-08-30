"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export function ArticleMotion({
  children,
  detail = false,
}: {
  children: ReactNode;
  detail?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const context = gsap.context(() => {
      const hero = root.querySelector("[data-article-hero]");
      const cards = root.querySelectorAll("[data-article-card]");

      if (hero) {
        gsap.fromTo(
          hero,
          { opacity: 0, y: 18, filter: "blur(5px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.62,
            ease: "power3.out",
            clearProps: "filter,transform,opacity",
          },
        );
      }

      if (cards.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.065,
            ease: "power3.out",
            clearProps: "transform,opacity",
          },
        );
      }
    }, root);

    let raf = 0;
    const updateProgress = () => {
      raf = 0;
      if (!detail) return;
      const content = root.querySelector<HTMLElement>("[data-article-content]");
      const bar = root.querySelector<HTMLElement>("[data-article-progress]");
      if (!content || !bar) return;

      const rect = content.getBoundingClientRect();
      const distance = Math.max(1, content.offsetHeight - window.innerHeight * 0.35);
      const progress = Math.max(0, Math.min(1, -rect.top / distance));
      bar.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(updateProgress);
    };

    if (detail) {
      updateProgress();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    return () => {
      context.revert();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [detail]);

  return (
    <div ref={rootRef} className="etis-articles-motion">
      {children}
    </div>
  );
}
