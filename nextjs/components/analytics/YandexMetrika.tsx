"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const COUNTER_ID = 110920062;
const CONSENT_STORAGE_KEY = "etis-cookie-consent-v1";
const CONSENT_EVENT = "etis:cookie-consent";
const SCRIPT_ID = "etis-yandex-metrika-script";

type ConsentPreferences = {
  analytics?: boolean;
};

type YmFunction = ((...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: YmFunction;
    dataLayer?: unknown[];
    __etisYandexMetrikaInitialized?: boolean;
  }
}

function readAnalyticsConsent(): boolean {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw) as ConsentPreferences;
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

function prepareMetrikaQueue() {
  window.dataLayer = window.dataLayer || [];

  if (typeof window.ym === "function") return;

  const ym: YmFunction = (...args: unknown[]) => {
    ym.a = ym.a || [];
    ym.a.push(args);
  };

  ym.l = Date.now();
  window.ym = ym;
}

function loadMetrikaScript() {
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`;
  document.head.appendChild(script);
}

export default function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const [enabled, setEnabled] = useState(false);
  const lastTrackedUrlRef = useRef("");

  useEffect(() => {
    setEnabled(readAnalyticsConsent());

    const handleConsent = (event: Event) => {
      const detail = (event as CustomEvent<ConsentPreferences>).detail;
      setEnabled(detail?.analytics === true);
    };

    window.addEventListener(CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
  }, []);

  useLayoutEffect(() => {
    if (!enabled) return;

    prepareMetrikaQueue();
    loadMetrikaScript();

    if (!window.__etisYandexMetrikaInitialized) {
      window.ym?.(COUNTER_ID, "init", {
        ssr: true,
        defer: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        referrer: document.referrer,
        url: window.location.href,
        accurateTrackBounce: true,
        trackLinks: true,
      });

      window.__etisYandexMetrikaInitialized = true;
    }

    const url = window.location.href;
    if (lastTrackedUrlRef.current !== url) {
      window.ym?.(COUNTER_ID, "hit", url, {
        title: document.title,
        referer: lastTrackedUrlRef.current || document.referrer,
      });
      lastTrackedUrlRef.current = url;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !window.__etisYandexMetrikaInitialized) return;

    const url = window.location.href;
    if (lastTrackedUrlRef.current === url) return;

    window.ym?.(COUNTER_ID, "hit", url, {
      title: document.title,
      referer: lastTrackedUrlRef.current || document.referrer,
    });

    lastTrackedUrlRef.current = url;
  }, [enabled, pathname, search]);

  useEffect(() => {
    if (enabled || !window.__etisYandexMetrikaInitialized) return;

    window.ym?.(COUNTER_ID, "destruct");
    window.__etisYandexMetrikaInitialized = false;
    lastTrackedUrlRef.current = "";
    document.getElementById(SCRIPT_ID)?.remove();
  }, [enabled]);

  return null;
}
