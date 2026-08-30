"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { Logo } from "@/components/layout/Logo";
import { useLenis } from "@/components/providers/LenisProvider";
import "./page-transition.css";

/**
 * Короткий фирменный переход etis.kz.
 *
 * Сценарий:
 * 1. Две диагональные синие панели быстро закрывают страницу.
 * 2. В центре появляется логотип ETC, а вокруг него вращаются 4 световые точки.
 * 3. После смены pathname панели расходятся, а новая страница мягко появляется.
 *
 * Важно:
 * - переход занимает около 0.8 секунды вместе с закрытием и открытием;
 * - query-only навигация (фильтры каталога) не перехватывается;
 * - внешние ссылки, якоря, download и новая вкладка работают нативно;
 * - при prefers-reduced-motion переход полностью отключён;
 * - есть аварийное открытие, если навигация зависнет.
 */

const SAFETY_TIMEOUT = 2200;

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const overlayRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const busyRef = useRef(false);
  const coveredRef = useRef(false);
  const firstRenderRef = useRef(true);
  const timerRef = useRef<number | null>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const orbitTweensRef = useRef<gsap.core.Tween[]>([]);
  const scrollbarLockRef = useRef<{
    bodyPaddingRight: string;
    fallbackApplied: boolean;
  } | null>(null);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Next App Router и Lenis могут каждый хранить свою позицию прокрутки.
   * Поэтому при реальной смене pathname обнуляем обе позиции синхронно,
   * а затем ещё раз на следующих кадрах — уже после монтажа новой страницы.
   * Transition закрывает контент, поэтому пользователь не видит скачка.
   */
  const scrollToPageTop = () => {
    if (typeof window === "undefined") return;

    const scrollingElement = document.scrollingElement as HTMLElement | null;

    if (scrollingElement) scrollingElement.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    lenis?.scrollTo(0, { immediate: true });
  };

  const stopOrbitDots = () => {
    orbitTweensRef.current.forEach((tween) => tween.kill());
    orbitTweensRef.current = [];
  };

  const startOrbitDots = () => {
    stopOrbitDots();

    const orbits = Array.from(
      orbitRef.current?.querySelectorAll<HTMLElement>(".etis-pt__orbit") ?? [],
    );

    const motion = [
      { duration: 0.72, direction: 360 },
      { duration: 0.96, direction: -360 },
      { duration: 1.22, direction: 360 },
      { duration: 1.58, direction: -360 },
    ];

    orbitTweensRef.current = orbits.map((orbit, index) => {
      const config = motion[index] ?? { duration: 1.58, direction: -360 };
      gsap.set(orbit, { rotate: index * 87 });

      return gsap.to(orbit, {
        rotate: `+=${config.direction}`,
        duration: config.duration,
        repeat: -1,
        ease: "none",
      });
    });
  };

  const clearSafetyTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const lockPage = () => {
    const html = document.documentElement;
    const body = document.body;

    /*
     * Не даём контенту прыгать по горизонтали, когда во время смены
     * маршрута браузер временно убирает вертикальный scrollbar.
     * В современных браузерах место держит scrollbar-gutter из CSS.
     * Для старых браузеров оставляем точную компенсацию padding-right.
     */
    if (!scrollbarLockRef.current) {
      const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
      const supportsStableGutter =
        typeof CSS !== "undefined" &&
        CSS.supports?.("scrollbar-gutter: stable");

      scrollbarLockRef.current = {
        bodyPaddingRight: body.style.paddingRight,
        fallbackApplied: !supportsStableGutter && scrollbarWidth > 0,
      };

      html.style.setProperty(
        "--etis-route-scrollbar-width",
        `${scrollbarWidth}px`,
      );

      if (!supportsStableGutter && scrollbarWidth > 0) {
        const currentPadding =
          Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      }
    }

    html.classList.add("etis-route-transitioning");
    lenis?.stop();
  };

  const unlockPage = () => {
    const html = document.documentElement;
    const body = document.body;
    const lockState = scrollbarLockRef.current;

    html.classList.remove("etis-route-transitioning");

    if (lockState?.fallbackApplied) {
      body.style.paddingRight = lockState.bodyPaddingRight;
    }

    html.style.removeProperty("--etis-route-scrollbar-width");
    scrollbarLockRef.current = null;
    lenis?.start();
  };

  const resetOverlay = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    gsap.set(overlay, {
      autoAlpha: 0,
      pointerEvents: "none",
      "--etis-pt-fog-opacity": 0,
    });
    overlay.style.display = "none";
    gsap.set(centerRef.current, { autoAlpha: 0, scale: 0.98 });
    gsap.set(leftPanelRef.current, { xPercent: -105 });
    gsap.set(rightPanelRef.current, { xPercent: 105 });
    gsap.set(logoRef.current, {
      opacity: 0,
      scale: 0.84,
      y: 10,
      filter: "blur(8px)",
    });
    stopOrbitDots();
    gsap.set(ringRef.current, { opacity: 0, scale: 0.72, rotate: -18 });
    gsap.set(orbitRef.current, { opacity: 0, scale: 0.74 });
    gsap.set(shineRef.current, { xPercent: -180, opacity: 0 });

  };

  const forceOpen = () => {
    activeTimelineRef.current?.kill();
    clearSafetyTimer();

    const overlay = overlayRef.current;
    if (!overlay) return;

    const tl = gsap.timeline({
      onComplete: () => {
        coveredRef.current = false;
        busyRef.current = false;
        resetOverlay();
        unlockPage();
      },
    });

    activeTimelineRef.current = tl;

    tl.to(
      overlay,
      {
        "--etis-pt-fog-opacity": 0,
        duration: 0.28,
        ease: "power2.out",
      },
      0,
    )
      .to(
        centerRef.current,
        {
          autoAlpha: 0,
          scale: 1.02,
          duration: 0.18,
          ease: "power2.in",
        },
        0.14,
      )
      .to(
        logoRef.current,
        {
          opacity: 0,
          scale: 1.2,
          y: 0,
          filter: "blur(10px)",
          duration: 0.2,
          ease: "power2.in",
        },
        0.14,
      )
      .to(
        ringRef.current,
        { opacity: 0, scale: 1.18, duration: 0.22, ease: "power2.in" },
        0.14,
      )
      .to(
        orbitRef.current,
        { opacity: 0, scale: 1.14, duration: 0.22, ease: "power2.in" },
        0.14,
      )
      .to(
        leftPanelRef.current,
        { xPercent: -105, duration: 0.4, ease: "power4.inOut" },
        0.18,
      )
      .to(
        rightPanelRef.current,
        { xPercent: 105, duration: 0.4, ease: "power4.inOut" },
        0.18,
      );
  };

  /*
   * Не позволяем браузеру восстанавливать старую позицию после client-side
   * навигации. Возвращаем исходное значение при размонтировании компонента.
   */
  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) {
      return;
    }

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  /* Открываем шторку после того, как App Router отдал новый pathname. */
  useEffect(() => {
    const content = contentRef.current;

    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      resetOverlay();
      gsap.set(content, { opacity: 1, y: 0, clearProps: "transform,opacity" });
      return;
    }

    clearSafetyTimer();

    // Новый pathname всегда начинается сверху — независимо от того,
    // откуда был нажат Link: футер, карточка, меню или router.push().
    scrollToPageTop();
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      scrollToPageTop();
      secondFrame = window.requestAnimationFrame(scrollToPageTop);
    });

    if (prefersReducedMotion()) {
      busyRef.current = false;
      coveredRef.current = false;
      resetOverlay();
      unlockPage();
      return;
    }

    /*
     * Back/forward может сменить pathname без нашего click-перехвата.
     * В таком случае не показываем шторку задним числом — только быстро
     * проявляем уже загруженный контент.
     */
    if (!coveredRef.current) {
      gsap.set(content, { opacity: 1, y: 0, clearProps: "transform,opacity" });
      return;
    }

    activeTimelineRef.current?.kill();

    const overlay = overlayRef.current;
    if (!overlay) return;

    const tl = gsap.timeline({
      onComplete: () => {
        coveredRef.current = false;
        busyRef.current = false;
        resetOverlay();
        unlockPage();
      },
    });

    activeTimelineRef.current = tl;

    tl.to(
      overlay,
      {
        "--etis-pt-fog-opacity": 0,
        duration: 0.3,
        ease: "power2.out",
      },
      0,
    )
      .to(
        centerRef.current,
        {
          autoAlpha: 0,
          scale: 1.02,
          duration: 0.2,
          ease: "power2.in",
        },
        0.15,
      )
      .to(
        logoRef.current,
        {
          opacity: 0,
          scale: 1.22,
          y: 0,
          filter: "blur(10px)",
          duration: 0.22,
          ease: "power2.in",
        },
        0.15,
      )
      .to(
        ringRef.current,
        {
          opacity: 0,
          scale: 1.2,
          rotate: 14,
          duration: 0.24,
          ease: "power2.in",
        },
        0.15,
      )
      .to(
        orbitRef.current,
        {
          opacity: 0,
          scale: 1.16,
          duration: 0.24,
          ease: "power2.in",
        },
        0.15,
      )
      .to(
        leftPanelRef.current,
        { xPercent: -105, duration: 0.44, ease: "power4.inOut" },
        0.19,
      )
      .to(
        rightPanelRef.current,
        { xPercent: 105, duration: 0.44, ease: "power4.inOut" },
        0.19,
      )
      .call(() => {
        gsap.set(content, { opacity: 1, y: 0, clearProps: "transform,opacity" });
      }, [], 0.1);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
      tl.kill();
    };
    // pathname — намеренно единственный маршрутный триггер.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* Перехватываем только настоящие переходы между pathname. */
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.(
        "a",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.closest("[data-no-transition]")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      /*
       * Фильтры/сортировка меняют только searchParams. Их нельзя закрывать
       * шторкой: pathname не изменится и эффект не получит сигнал на открытие.
       */
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      event.stopPropagation();

      if (busyRef.current) return;
      busyRef.current = true;
      coveredRef.current = false;

      const overlay = overlayRef.current;
      if (!overlay) {
        busyRef.current = false;
        router.push(url.pathname + url.search + url.hash, { scroll: false });
        return;
      }

      activeTimelineRef.current?.kill();
      clearSafetyTimer();

      lockPage();

      overlay.style.display = "block";
      gsap.set(overlay, {
        autoAlpha: 1,
        pointerEvents: "auto",
        "--etis-pt-fog-opacity": 0,
      });
      gsap.set(centerRef.current, { autoAlpha: 0, scale: 0.96 });

      gsap.set(leftPanelRef.current, { xPercent: -105 });
      gsap.set(rightPanelRef.current, { xPercent: 105 });
      gsap.set(logoRef.current, {
        opacity: 0,
        scale: 0.84,
        y: 10,
        filter: "blur(8px)",
      });
      gsap.set(ringRef.current, {
        opacity: 0,
        scale: 0.72,
        rotate: -18,
      });
      gsap.set(orbitRef.current, { opacity: 0, scale: 0.74 });
      gsap.set(shineRef.current, { xPercent: -180, opacity: 0 });
      startOrbitDots();

      const tl = gsap.timeline({
        onComplete: () => {
          coveredRef.current = true;

          // Старую страницу также ставим в начало под закрытым overlay,
          // а прокрутку новой страницы окончательно фиксирует pathname-effect.
          scrollToPageTop();
          router.push(url.pathname + url.search + url.hash, { scroll: false });

          timerRef.current = window.setTimeout(() => {
            forceOpen();
          }, SAFETY_TIMEOUT);
        },
      });

      activeTimelineRef.current = tl;

      tl.to(
        overlay,
        {
          "--etis-pt-fog-opacity": 1,
          duration: 0.28,
          ease: "power2.out",
        },
        0,
      )
        .to(
          leftPanelRef.current,
          { xPercent: 0, duration: 0.34, ease: "power4.inOut" },
          0,
        )
        .to(
          centerRef.current,
          { autoAlpha: 1, scale: 1, duration: 0.2, ease: "power2.out" },
          0.08,
        )
        .to(
          rightPanelRef.current,
          { xPercent: 0, duration: 0.34, ease: "power4.inOut" },
          0,
        )
        .to(
          ringRef.current,
          {
            opacity: 0.94,
            scale: 1,
            rotate: 0,
            duration: 0.28,
            ease: "back.out(1.45)",
          },
          0.1,
        )
        .to(
          orbitRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.28,
            ease: "back.out(1.4)",
          },
          0.11,
        )
        .to(
          logoRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.25,
            ease: "back.out(1.6)",
          },
          0.13,
        )
        .to(
          shineRef.current,
          {
            opacity: 0.9,
            xPercent: 210,
            duration: 0.32,
            ease: "power2.inOut",
          },
          0.16,
        );
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      activeTimelineRef.current?.kill();
      stopOrbitDots();
      clearSafetyTimer();
      unlockPage();
    };
    // router и lenis нужны обработчику, pathname берётся из window.
  }, [router, lenis]);

  return (
    <>
      <div className="etis-pt" ref={overlayRef} aria-hidden="true">
        <div
          ref={leftPanelRef}
          className="etis-pt__panel etis-pt__panel--left"
        />
        <div
          ref={rightPanelRef}
          className="etis-pt__panel etis-pt__panel--right"
        />

        <div className="etis-pt__ambient" />
        <div className="etis-pt__grid" />

        <div ref={centerRef} className="etis-pt__center">
          <div ref={ringRef} className="etis-pt__rings" aria-hidden="true">
            <span />
            <span />
          </div>

          <div ref={orbitRef} className="etis-pt__orbits" aria-hidden="true">
            <span className="etis-pt__orbit etis-pt__orbit--1">
              <i className="etis-pt__orbit-dot" />
            </span>
            <span className="etis-pt__orbit etis-pt__orbit--2">
              <i className="etis-pt__orbit-dot" />
            </span>
            <span className="etis-pt__orbit etis-pt__orbit--3">
              <i className="etis-pt__orbit-dot" />
            </span>
            <span className="etis-pt__orbit etis-pt__orbit--4">
              <i className="etis-pt__orbit-dot" />
            </span>
          </div>

          <div ref={logoRef} className="etis-pt__logo">
            <Logo size={84} />
            <span ref={shineRef} className="etis-pt__shine" />
          </div>
        </div>
      </div>

      <div className="etis-pt__content" ref={contentRef}>
        {children}
      </div>
    </>
  );
}
