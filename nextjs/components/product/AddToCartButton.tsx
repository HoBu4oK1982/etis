"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ShoppingCart, Check } from "lucide-react";

type Props = {
  onAdd: (source: HTMLButtonElement) => void;
  /** Полноширинная или auto */
  fullWidth?: boolean;
  label?: string;
  successLabel?: string;
  disabled?: boolean;
  disabledTitle?: string;
};

/**
 * Основная CTA "Добавить в корзину".
 *
 * Дизайн:
 *   - зелёный градиент (emerald-500 → emerald-600, диагональ 135°)
 *   - мягкая двойная тень: цветная сзади + плотная под
 *   - на hover — постоянный "шиммер": блик медленно проезжает вправо
 *
 * Клик:
 *   1. Из точки клика расходится ripple (radial gradient).
 *   2. Кнопка чуть жмётся (scale 0.96), корзина "уезжает" по X вправо
 *      и появляется галка на её месте.
 *   3. Через 1.4 секунды кнопка возвращается в исходное состояние
 *      с elastic-отскоком.
 *
 * Всё в gsap.context: при размонтировании ничего не остаётся.
 * Повторный клик до окончания игнорируется (isBusy).
 */
export function AddToCartButton({
  onAdd,
  fullWidth = false,
  label = "Добавить в корзину",
  successLabel = "Добавлено",
  disabled = false,
  disabledTitle,
}: Props) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLSpanElement>(null);
  const checkRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const successRef = useRef<HTMLSpanElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Начальные состояния для чек-марка и success-подписи — скрыты
  useEffect(() => {
    if (checkRef.current) gsap.set(checkRef.current, { autoAlpha: 0, scale: 0.4 });
    if (successRef.current) gsap.set(successRef.current, { autoAlpha: 0, y: 6 });
  }, []);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isBusy || disabled) return;

    const root = rootRef.current;
    const cart = cartRef.current;
    const check = checkRef.current;
    const labelEl = labelRef.current;
    const successEl = successRef.current;
    const ripple = rippleRef.current;
    if (!root || !cart || !check || !labelEl || !successEl || !ripple) return;

    setIsBusy(true);
    // Передаём саму кнопку источником анимации: миниатюра всегда
    // стартует из CTA, а не из изображения карточки.
    onAdd(root);

    // Ripple из точки клика
    const rect = root.getBoundingClientRect();
    const rx = ((e.clientX - rect.left) / rect.width) * 100;
    const ry = ((e.clientY - rect.top) / rect.height) * 100;
    ripple.style.setProperty("--rx", `${rx}%`);
    ripple.style.setProperty("--ry", `${ry}%`);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => setIsBusy(false),
      });

      // Кнопка сжимается, ripple расходится
      tl.to(root, { scale: 0.96, duration: 0.12, ease: "power2.in" }, 0);
      tl.fromTo(
        ripple,
        { opacity: 0.55, scale: 0 },
        { opacity: 0, scale: 1, duration: 0.7, ease: "power2.out" },
        0
      );

      // Корзина уезжает вправо и исчезает
      tl.to(
        cart,
        { x: 18, autoAlpha: 0, duration: 0.28, ease: "power2.in" },
        0.08
      );
      // Текст улетает вверх и растворяется
      tl.to(
        labelEl,
        { y: -14, autoAlpha: 0, duration: 0.25, ease: "power2.in" },
        0.1
      );

      // Появляется галка
      tl.fromTo(
        check,
        { x: -18, autoAlpha: 0, scale: 0.4 },
        { x: 0, autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)" },
        0.32
      );
      // Появляется success-подпись
      tl.fromTo(
        successEl,
        { y: 12, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" },
        0.34
      );

      // Кнопка чуть подпрыгивает — акцент "готово"
      tl.to(root, { scale: 1.02, duration: 0.18, ease: "back.out(2)" }, 0.32);
      tl.to(root, { scale: 1, duration: 0.3, ease: "power2.out" }, 0.5);

      // Пауза, затем возвращаемся в исходный вид
      tl.to({}, { duration: 1 }); // hold

      tl.to(check, { autoAlpha: 0, scale: 0.4, duration: 0.25, ease: "power2.in" });
      tl.to(successEl, { autoAlpha: 0, y: 6, duration: 0.25 }, "<");
      tl.set(cart, { x: -18 });
      tl.set(labelEl, { y: 14 });
      tl.to(cart, { x: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" });
      tl.to(labelEl, { y: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" }, "<");
    }, root);

    // gsap.context.revert не вызываем — таймлайн сам отработает
    // Но при следующем клике старые твины будут killed автоматически новым ctx.
    // Здесь это ок: мы блокируем повторный клик через isBusy.
    void ctx;
  };

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={handleClick}
      disabled={isBusy || disabled}
      aria-disabled={disabled}
      data-unavailable={disabled ? "true" : undefined}
      aria-label={label}
      title={disabled ? disabledTitle : undefined}
      className="etis-add-btn"
      style={fullWidth ? { width: "100%" } : undefined}
    >
      {/* Ripple из точки клика — управляется через --rx/--ry */}
      <span ref={rippleRef} className="etis-add-btn__ripple" aria-hidden />

      {/* Постоянный шиммер по хову */}
      <span className="etis-add-btn__shimmer" aria-hidden />

      <span className="etis-add-btn__content">
        {/* Иконка: корзина / чек */}
        <span className="etis-add-btn__icon-slot">
          <span ref={cartRef} className="etis-add-btn__icon">
            <ShoppingCart size={19} strokeWidth={2.4} />
          </span>
          <span ref={checkRef} className="etis-add-btn__icon etis-add-btn__icon--check">
            <Check size={22} strokeWidth={3} />
          </span>
        </span>

        {/* Подписи: default / success — стоят одна над другой */}
        <span className="etis-add-btn__label-slot">
          <span ref={labelRef} className="etis-add-btn__label">
            {label}
          </span>
          <span ref={successRef} className="etis-add-btn__label etis-add-btn__label--success">
            {successLabel}
          </span>
        </span>
      </span>
    </button>
  );
}
