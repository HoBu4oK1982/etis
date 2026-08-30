"use client";

import Link from "next/link";
import gsap from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./CookieConsent.module.css";

type ConsentPreferences = {
  version: 1;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "etis-cookie-consent-v1";
const OPEN_EVENT = "etis:open-cookie-settings";

function readConsent(): ConsentPreferences | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (parsed.version !== 1) return null;

    return {
      version: 1,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: String(parsed.updatedAt || ""),
    };
  } catch {
    return null;
  }
}

function publishConsent(preferences: ConsentPreferences) {
  const mode = preferences.marketing
    ? "all"
    : preferences.analytics
      ? "analytics"
      : "necessary";

  document.documentElement.dataset.cookieConsent = mode;
  window.dispatchEvent(
    new CustomEvent<ConsentPreferences>("etis:cookie-consent", {
      detail: preferences,
    })
  );
}

export default function CookieConsent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const showTimerRef = useRef<number | null>(null);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => {
    setMounted(true);
    window.requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const existing = readConsent();

    if (existing) {
      publishConsent(existing);
    } else {
      showTimerRef.current = window.setTimeout(show, 1150);
    }

    window.addEventListener(OPEN_EVENT, show);

    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [show]);

  useLayoutEffect(() => {
    if (!mounted || !visible || !rootRef.current || !panelRef.current) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        rootRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: reducedMotion ? 0.01 : 0.28 }
      );

      gsap.fromTo(
        panelRef.current,
        { y: reducedMotion ? 0 : 72, scale: reducedMotion ? 1 : 0.965 },
        {
          y: 0,
          scale: 1,
          duration: reducedMotion ? 0.01 : 0.72,
          ease: "power4.out",
        }
      );

      if (!reducedMotion) {
        const orbits = gsap.utils.toArray<HTMLElement>("[data-cookie-orbit]");
        orbits.forEach((orbit, index) => {
          gsap.to(orbit, {
            rotation: index % 2 === 0 ? 360 : -360,
            duration: [4.8, 6.4, 8.2, 10.5][index] ?? 7,
            repeat: -1,
            ease: "none",
            transformOrigin: "50% 50%",
          });
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [mounted, visible]);

  const hide = useCallback((onComplete?: () => void) => {
    if (!rootRef.current || !panelRef.current) {
      onComplete?.();
      setMounted(false);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    gsap
      .timeline({
        onComplete: () => {
          setVisible(false);
          setMounted(false);
          onComplete?.();
        },
      })
      .to(panelRef.current, {
        y: reducedMotion ? 0 : 34,
        scale: reducedMotion ? 1 : 0.985,
        autoAlpha: 0,
        duration: reducedMotion ? 0.01 : 0.38,
        ease: "power3.in",
      })
      .to(
        rootRef.current,
        {
          autoAlpha: 0,
          duration: reducedMotion ? 0.01 : 0.18,
        },
        "-=0.12"
      );
  }, []);

  const save = useCallback(
    (accepted: boolean) => {
      const preferences: ConsentPreferences = {
        version: 1,
        necessary: true,
        analytics: accepted,
        marketing: accepted,
        updatedAt: new Date().toISOString(),
      };

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch {
        // В приватном режиме выбор применяется до перезагрузки страницы.
      }

      publishConsent(preferences);
      hide();
    },
    [hide]
  );

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      className={styles.layer}
      data-visible={visible ? "true" : "false"}
    >
      <section
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="false"
        aria-labelledby="etis-cookie-title"
        aria-describedby="etis-cookie-description"
      >
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.visualCore}>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M20.2 13.1A8.2 8.2 0 0 1 10.9 3.8 8.2 8.2 0 1 0 20.2 13.1Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8.4" cy="11.2" r="1" fill="currentColor" />
              <circle cx="12.7" cy="15.4" r="1.15" fill="currentColor" />
              <circle cx="8.9" cy="17.2" r="0.75" fill="currentColor" />
            </svg>
          </div>

          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={`${styles.orbit} ${styles[`orbit${index + 1}`]}`}
              data-cookie-orbit
            >
              <i />
            </span>
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>КОНФИДЕНЦИАЛЬНОСТЬ</span>
            <h2 id="etis-cookie-title">Использование файлов cookie</h2>
            <p id="etis-cookie-description">
              Необходимые cookie обеспечивают работу сайта. Аналитические и
              маркетинговые cookie включаются только после согласия. Подробнее в{" "}
              <Link href="/privacy">политике конфиденциальности</Link>.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => save(true)}
            >
              <span>Принять</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m8 12 2.7 2.7L16.5 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => save(false)}
            >
              Отказаться
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
