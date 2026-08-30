"use client";

import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/stores/theme";

/**
 * Кнопка-переключатель тёмной/светлой темы.
 * Показывает Sun в тёмной теме (кликнув, вернёшься к светлой)
 * и Moon в светлой (кликнув, включишь тёмную).
 *
 * Хайдрация: при монтаже вызываем hydrate(), который читает localStorage
 * и подписывается на изменение системной темы. До этого data-theme уже
 * выставил inline-script в <head> (см. app/layout.tsx) — без вспышки.
 */
export function ThemeToggle() {
  const resolved = useTheme((s) => s.resolved);
  const toggle = useTheme((s) => s.toggle);
  const hydrate = useTheme((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      className="
        relative inline-flex items-center justify-center
        w-9 h-9 shrink-0 rounded-full
        text-brand-600 hover:text-brand-700
        border border-transparent hover:border-brand-100
        transition-colors
      "
    >
      {/* Плавная замена иконок через opacity/rotate */}
      <Sun
        size={18}
        className={`absolute transition-all duration-300 ${
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        }`}
      />
      <Moon
        size={18}
        className={`absolute transition-all duration-300 ${
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
      />
    </button>
  );
}
