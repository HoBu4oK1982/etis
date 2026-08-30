"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import gsap from "gsap";
import {
  ArrowRight,
  Check,
  Loader2,
  Phone,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import type { Product } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils/price";
import { formatPhone, phoneDigits, phoneOnKeyDown } from "@/lib/utils/phone-mask";
import styles from "./ProductOneClick.module.css";

type Props = {
  product: Product;
  quantity: number;
  unitPrice: number | null;
  variant?: "primary" | "secondary";
};

type FieldErrors = {
  name?: string;
  phone?: string;
};

export function ProductOneClick({
  product,
  quantity,
  unitPrice,
  variant = "secondary",
}: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const startedAtRef = useRef(Date.now());
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7");
  const [website, setWebsite] = useState("");
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const hasPrice = typeof unitPrice === "number" && unitPrice > 0;
  const totalPrice = hasPrice ? unitPrice * quantity : null;

  const show = () => {
    startedAtRef.current = Date.now();
    setMessage("");
    setErrors({});
    setSuccess(false);
    setOpen(true);
  };

  const hide = () => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const root = dialogRef.current;

    if (!panel || !backdrop || !root) {
      setOpen(false);
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setOpen(false);
      return;
    }

    const tl = gsap.timeline({ onComplete: () => setOpen(false) });
    tl.to(panel, {
      y: 18,
      scale: 0.98,
      autoAlpha: 0,
      duration: 0.22,
      ease: "power2.in",
    });
    tl.to(
      backdrop,
      { autoAlpha: 0, backdropFilter: "blur(0px)", duration: 0.25 },
      "<",
    );
  };

  useEffect(() => {
    if (!open) return;

    const root = dialogRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!root || !panel || !backdrop) return;

    const previousOverflow = document.documentElement.style.overflow;
    const previousPadding = document.documentElement.style.paddingRight;
    const scrollbar = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth,
    );

    document.documentElement.style.overflow = "hidden";
    if (scrollbar > 0) document.documentElement.style.paddingRight = `${scrollbar}px`;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      gsap.fromTo(
        backdrop,
        { autoAlpha: 0, backdropFilter: "blur(0px)" },
        {
          autoAlpha: 1,
          backdropFilter: "blur(14px)",
          duration: 0.34,
          ease: "power2.out",
        },
      );
      gsap.fromTo(
        panel,
        { y: 28, scale: 0.955, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.48,
          ease: "back.out(1.45)",
          delay: 0.04,
        },
      );
      gsap.fromTo(
        panel.querySelectorAll("[data-oneclick-reveal]"),
        { y: 12, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.38,
          stagger: 0.045,
          ease: "power2.out",
          delay: 0.15,
        },
      );
    }

    const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), 240);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pendingRef.current) hide();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      gsap.killTweensOf([panel, backdrop]);
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.style.paddingRight = previousPadding;
    };
  }, [open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const nextErrors: FieldErrors = {};
    if (name.trim().length < 2) nextErrors.name = "Укажите имя";
    if (phoneDigits(phone).length !== 11) {
      nextErrors.phone = "Введите полный номер телефона";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    pendingRef.current = true;
    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/one-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          website,
          startedAt: startedAtRef.current,
          productId: product.id,
          productTitle: product.title,
          productSlug: product.slug,
          productSku: product.sku ?? "",
          quantity,
          unitPrice,
          totalPrice,
          page: window.location.href,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        fields?: FieldErrors;
      };

      if (!response.ok || !data.ok) {
        if (data.fields) setErrors(data.fields);
        setMessage(data.message || "Не удалось отправить заявку.");
        return;
      }

      setSuccess(true);
      setMessage(data.message || "Заявка отправлена.");

      const panel = panelRef.current;
      if (panel && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(
          panel.querySelector(`.${styles.successIcon}`),
          { scale: 0.4, rotate: -18, autoAlpha: 0 },
          {
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
            duration: 0.55,
            ease: "back.out(2.2)",
          },
        );
      }
    } catch {
      setMessage("Сервис временно недоступен. Позвоните нам по телефону.");
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        className={`${styles.trigger} ${
          variant === "primary" ? styles.triggerPrimary : styles.triggerSecondary
        }`}
      >
        <span className={styles.triggerGlow} aria-hidden />
        <ShoppingBag size={19} strokeWidth={2.35} />
        <span>Купить в один клик</span>
        <ArrowRight size={18} />
      </button>

      {open && (
        <div
          ref={dialogRef}
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div
            ref={backdropRef}
            className={styles.backdrop}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !pending) hide();
            }}
          >
            <div ref={panelRef} className={styles.panel}>
              <button
                type="button"
                className={styles.close}
                onClick={hide}
                disabled={pending}
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>

              {!success ? (
                <>
                  <div className={styles.head} data-oneclick-reveal>
                    <div className={styles.iconStage} aria-hidden>
                      <Sparkles size={25} />
                      <i className={styles.orbitOne} />
                      <i className={styles.orbitTwo} />
                      <i className={styles.orbitThree} />
                    </div>
                    <div>
                      <span className={styles.eyebrow}>Быстрый заказ</span>
                      <h2 id={titleId}>Купить в один клик</h2>
                      <p>Оставьте имя и телефон — менеджер уточнит цену и детали заказа.</p>
                    </div>
                  </div>

                  <div className={styles.product} data-oneclick-reveal>
                    <span className={styles.productLabel}>Вы выбрали</span>
                    <strong>{product.title}</strong>
                    <div className={styles.productMeta}>
                      {product.sku ? <span>Артикул: {product.sku}</span> : null}
                      <span>{quantity} шт.</span>
                      <span>
                        {totalPrice !== null
                          ? formatPrice(totalPrice)
                          : "Цена по запросу"}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={submit} className={styles.form} noValidate>
                    <label data-oneclick-reveal>
                      <span>Ваше имя</span>
                      <div className={styles.inputWrap} data-error={Boolean(errors.name)}>
                        <UserRound size={18} />
                        <input
                          ref={firstInputRef}
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Введите ваше имя"
                          autoComplete="name"
                          maxLength={80}
                        />
                      </div>
                      {errors.name ? <small>{errors.name}</small> : null}
                    </label>

                    <label data-oneclick-reveal>
                      <span>Номер телефона</span>
                      <div className={styles.inputWrap} data-error={Boolean(errors.phone)}>
                        <Phone size={18} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(event) => setPhone(formatPhone(event.target.value))}
                          onKeyDown={(event) => phoneOnKeyDown(event, phone, setPhone)}
                          placeholder="+7 (___) ___-__-__"
                          autoComplete="tel"
                          inputMode="tel"
                        />
                      </div>
                      {errors.phone ? <small>{errors.phone}</small> : null}
                    </label>

                    <input
                      className={styles.honeypot}
                      type="text"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    {message ? <div className={styles.errorBox}>{message}</div> : null}

                    <button
                      type="submit"
                      className={styles.submit}
                      disabled={pending}
                      data-oneclick-reveal
                    >
                      {pending ? (
                        <Loader2 className={styles.spinner} size={20} />
                      ) : (
                        <ShoppingBag size={20} />
                      )}
                      <span>{pending ? "Отправляем…" : "Отправить быстрый заказ"}</span>
                      {!pending ? <ArrowRight size={18} /> : null}
                    </button>
                  </form>
                </>
              ) : (
                <div className={styles.success}>
                  <div className={styles.successIcon}>
                    <Check size={34} strokeWidth={3} />
                  </div>
                  <span className={styles.eyebrow}>Заявка отправлена</span>
                  <h2 id={titleId}>Уже у менеджера</h2>
                  <p>{message}</p>
                  <button type="button" onClick={hide} className={styles.successButton}>
                    Отлично
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
