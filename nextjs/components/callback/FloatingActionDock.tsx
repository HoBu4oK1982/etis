"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import {
  ArrowUp,
  Headphones,
  MessageCircleMore,
  Phone,
  PhoneCall,
  X,
} from "lucide-react";
import { useLenis } from "@/components/providers/LenisProvider";
import { CallbackTrigger } from "./CallbackTrigger";
import styles from "./FloatingActionDock.module.css";

const PHONE_NUMBER = "+7 (727) 328 05 75";
const PHONE_HREF = "tel:+77273280575";
const WHATSAPP_HREF = "https://wa.me/77273280575";

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function OrbitDots({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`${styles.orbitSystem} ${compact ? styles.orbitSystemCompact : ""}`}
      aria-hidden="true"
    >
      <span className={styles.orbitOne} data-action-orbit data-speed="2.15">
        <i />
      </span>
      <span className={styles.orbitTwo} data-action-orbit data-speed="2.85">
        <i />
      </span>
      <span className={styles.orbitThree} data-action-orbit data-speed="3.7">
        <i />
      </span>
    </span>
  );
}

export function FloatingActionDock() {
  const pathname = usePathname();
  const lenis = useLenis();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const scrollButtonRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;

    const updateScrollState = () => {
      raf = 0;
      const documentElement = document.documentElement;
      const maxScroll = Math.max(
        1,
        documentElement.scrollHeight - window.innerHeight,
      );
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const percent = Math.round(progress * 100);
      const button = scrollButtonRef.current;

      button?.style.setProperty("--scroll-progress", `${percent}%`);
      button?.setAttribute(
        "aria-label",
        `Наверх. Страница просмотрена на ${percent}%`,
      );

      if (progressRef.current) {
        progressRef.current.textContent = `${percent}%`;
      }

      const nextVisible = window.scrollY > 180;
      setShowScrollTop((current) =>
        current === nextVisible ? current : nextVisible,
      );
    };

    const scheduleUpdate = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useLayoutEffect(() => {
    const button = scrollButtonRef.current;
    if (!button) return;

    const reduced = reducedMotion();
    gsap.killTweensOf(button);
    gsap.to(button, {
      autoAlpha: showScrollTop ? 1 : 0,
      y: showScrollTop ? 0 : 14,
      scale: showScrollTop ? 1 : 0.88,
      duration: reduced ? 0.01 : 0.3,
      ease: "power3.out",
      pointerEvents: showScrollTop ? "auto" : "none",
    });
  }, [showScrollTop]);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const toggle = toggleRef.current;
    if (!menu || !toggle) return;

    const items = Array.from(
      menu.querySelectorAll<HTMLElement>("[data-floating-action]"),
    );
    const reduced = reducedMotion();

    gsap.killTweensOf(items);
    gsap.killTweensOf(toggle);

    if (menuOpen) {
      menu.style.pointerEvents = "auto";
      menu.setAttribute("aria-hidden", "false");

      gsap.fromTo(
        items,
        {
          autoAlpha: 0,
          y: 18,
          x: 8,
          scale: 0.86,
        },
        {
          autoAlpha: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: reduced ? 0.01 : 0.34,
          stagger: reduced ? 0 : 0.06,
          ease: "back.out(1.7)",
        },
      );

      gsap.to(toggle, {
        rotate: reduced ? 0 : 6,
        scale: 1.04,
        duration: reduced ? 0.01 : 0.24,
        ease: "power2.out",
      });
    } else {
      const finish = () => {
        menu.style.pointerEvents = "none";
        menu.setAttribute("aria-hidden", "true");
      };

      gsap.to(items, {
        autoAlpha: 0,
        y: 12,
        x: 7,
        scale: 0.9,
        duration: reduced ? 0.01 : 0.2,
        stagger: reduced ? 0 : 0.035,
        ease: "power2.in",
        onComplete: finish,
      });

      gsap.to(toggle, {
        rotate: 0,
        scale: 1,
        duration: reduced ? 0.01 : 0.24,
        ease: "power2.out",
      });
    }
  }, [menuOpen]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion()) return;

    const orbits = Array.from(
      root.querySelectorAll<HTMLElement>("[data-action-orbit]"),
    );

    const tweens = orbits.map((orbit, index) => {
      const speed = Number(orbit.dataset.speed || 2.6) + (index % 3) * 0.18;
      const direction = index % 2 === 0 ? 360 : -360;

      return gsap.to(orbit, {
        rotate: `+=${direction}`,
        duration: speed,
        repeat: -1,
        ease: "none",
      });
    });

    return () => tweens.forEach((tween) => tween.kill());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!menuOpen || !rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const scrollToTop = () => {
    setMenuOpen(false);
    if (!reducedMotion() && lenis) {
      lenis.scrollTo(0, { duration: 1.05 });
      return;
    }

    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  /**
   * Гарантированно прячет меню + сбрасывает все GSAP-твины на items.
   *
   * Нужен для случая, когда клик по пункту меню одновременно
   * открывает модалку — CallbackTrigger стартует свою click-timeline
   * на кнопке, а сразу за этим useLayoutEffect с menuOpen=false
   * запускает fade-out. Иногда они гоняются друг с другом, и autoAlpha
   * не успевает добраться до 0 — пилюля остаётся видимой на экране,
   * но при этом уже pointer-events:none и не кликается.
   *
   * Форс-set перед setMenuOpen(false) убирает race: сразу выставляет
   * целевые значения, а useLayoutEffect уже нечего анимировать.
   */
  const forceCloseMenu = () => {
    const menu = menuRef.current;
    if (menu) {
      const items = menu.querySelectorAll<HTMLElement>("[data-floating-action]");
      gsap.killTweensOf(items);
      gsap.set(items, { autoAlpha: 0, y: 12, x: 7, scale: 0.9 });
      menu.style.pointerEvents = "none";
      menu.setAttribute("aria-hidden", "true");
    }
    setMenuOpen(false);
  };

  return (
    <div ref={rootRef} className={styles.dock} data-lenis-prevent>
      <button
        ref={scrollButtonRef}
        type="button"
        className={styles.scrollButton}
        onClick={scrollToTop}
        tabIndex={showScrollTop ? 0 : -1}
        aria-label="Наверх"
      >
        <span className={styles.water} aria-hidden="true">
          <i />
          <b />
        </span>
        <span className={styles.scrollIcon} aria-hidden="true">
          <ArrowUp size={21} strokeWidth={2.5} />
        </span>
        <span ref={progressRef} className={styles.progressLabel}>
          0%
        </span>
      </button>

      <div className={styles.contactCluster}>
        <div
          ref={menuRef}
          id="etis-floating-contact-actions"
          className={styles.actionMenu}
          aria-hidden="true"
        >
          <a
            href={PHONE_HREF}
            className={`${styles.actionButton} ${styles.actionCall}`}
            data-floating-action
            onClick={forceCloseMenu}
          >
            <span className={styles.actionIcon} aria-hidden="true">
              <OrbitDots compact />
              <Phone size={19} />
            </span>
            <span className={styles.actionCopy}>
              <small>Позвонить</small>
              <b>{PHONE_NUMBER}</b>
            </span>
          </a>

          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noreferrer"
            className={`${styles.actionButton} ${styles.actionWhatsapp}`}
            data-floating-action
            onClick={forceCloseMenu}
          >
            <span className={styles.actionIcon} aria-hidden="true">
              <OrbitDots compact />
              <MessageCircleMore size={20} />
            </span>
            <span className={styles.actionCopy}>
              <small>Написать</small>
              <b>WhatsApp</b>
            </span>
          </a>

          <CallbackTrigger
            source="floating-contact-menu"
            className={`${styles.actionButton} ${styles.actionCallback}`}
            data-floating-action
            onClick={forceCloseMenu}
            aria-label="Заказать обратный звонок"
          >
            <span className={styles.actionIcon} aria-hidden="true">
              <OrbitDots compact />
              <Headphones size={20} />
            </span>
            <span className={styles.actionCopy}>
              <small>Оставить номер</small>
              <b>Перезвоните мне</b>
            </span>
          </CallbackTrigger>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={`${styles.contactToggle} ${menuOpen ? styles.contactToggleOpen : ""}`}
          aria-label={menuOpen ? "Закрыть способы связи" : "Открыть способы связи"}
          aria-expanded={menuOpen}
          aria-controls="etis-floating-contact-actions"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <OrbitDots />
          <span className={styles.togglePulse} aria-hidden="true" />
          <span className={styles.toggleIcon} aria-hidden="true">
            {menuOpen ? <X size={24} /> : <PhoneCall size={23} />}
          </span>
        </button>
      </div>
    </div>
  );
}
