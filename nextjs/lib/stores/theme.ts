"use client";

import { create } from "zustand";

/**
 * Стор для темы оформления etis.kz.
 *
 * theme:
 *   - 'light' — светлая
 *   - 'dark'  — тёмная
 *   - 'system' — использовать prefers-color-scheme браузера
 *
 * resolved — реально применённое значение ('light' | 'dark').
 * Хранение — localStorage ключ 'etis-theme' (совпадает с тем что читает
 * no-flash inline-script в <head>).
 */

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "etis-theme";

type State = {
  theme: ThemeMode;
  resolved: ResolvedTheme;
  /** Установить конкретную тему (light | dark | system) */
  setTheme: (t: ThemeMode) => void;
  /** Переключить: light ↔ dark (игнорирует system) */
  toggle: () => void;
  /** Инициализация из localStorage + подписка на системные изменения */
  hydrate: () => void;
};

function systemPref(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolved;
}

function readStored(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* localStorage может упасть в приватном режиме — не критично */
  }
  return "system";
}

function writeStored(t: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
}

export const useTheme = create<State>((set, get) => ({
  theme: "system",
  resolved: "light",

  setTheme: (t) => {
    writeStored(t);
    const resolved: ResolvedTheme = t === "system" ? systemPref() : t;
    apply(resolved);
    set({ theme: t, resolved });
  },

  toggle: () => {
    const next: ThemeMode = get().resolved === "dark" ? "light" : "dark";
    get().setTheme(next);
  },

  hydrate: () => {
    const stored = readStored();
    const resolved: ResolvedTheme = stored === "system" ? systemPref() : stored;
    apply(resolved);
    set({ theme: stored, resolved });

    // Реагируем на изменение системной темы, если пользователь выбрал 'system'
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        if (get().theme !== "system") return;
        const r: ResolvedTheme = mq.matches ? "dark" : "light";
        apply(r);
        set({ resolved: r });
      };
      // Modern браузеры: addEventListener; Safari <14 — addListener (не важно)
      mq.addEventListener?.("change", onChange);
    }
  },
}));
