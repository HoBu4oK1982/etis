"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import "./about-company-stats.css";

const PROJECTS = 1000;
const EXPERIENCE = 10;

export function AboutCompanyStats() {
  const rootRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const projects = projectsRef.current;
    const experience = experienceRef.current;

    if (!root || !projects || !experience) return;

    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const writeValue = (element: HTMLElement, value: number) => {
      element.textContent = `${Math.round(value)}+`;
    };

    if (reducedMotion) {
      writeValue(projects, PROJECTS);
      writeValue(experience, EXPERIENCE);
      return;
    }

    const ctx = gsap.context(() => {
      const values = {
        projects: 0,
        experience: 0,
      };

      writeValue(projects, 0);
      writeValue(experience, 0);

      const counters = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 82%",
          once: true,
        },
      });

      counters
        .to(values, {
          projects: PROJECTS,
          duration: 1.55,
          ease: "power3.out",
          onUpdate: () => writeValue(projects, values.projects),
        })
        .to(
          values,
          {
            experience: EXPERIENCE,
            duration: 1.05,
            ease: "power3.out",
            onUpdate: () => writeValue(experience, values.experience),
          },
          0.12
        );

      /*
       * Белая карточка движется по скроллу:
       * вниз при прокрутке вниз и возвращается вверх при обратном скролле.
       * scrub связывает позицию напрямую с прогрессом страницы.
       */
      gsap.fromTo(
        root,
        { y: -18 },
        {
          y: 34,
          ease: "none",
          scrollTrigger: {
            trigger: root.parentElement ?? root,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.85,
            invalidateOnRefresh: true,
          },
        }
      );
    }, root);

    const refreshFrame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="about-company-stats">
      <strong>
        Нам доверяют
        <br />
        профессионалы
      </strong>

      <div>
        <b
          ref={projectsRef}
          aria-label={`${PROJECTS}+ успешных проектов`}
          suppressHydrationWarning
        >
          0+
        </b>
        <span>успешных проектов</span>
      </div>

      <div>
        <b
          ref={experienceRef}
          aria-label={`${EXPERIENCE}+ лет опыта`}
          suppressHydrationWarning
        >
          0+
        </b>
        <span>лет опыта</span>
      </div>
    </div>
  );
}
