"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  LogIn,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Logo } from "@/components/layout/Logo";
import { NoPhoto } from "@/components/product/NoPhoto";
import { getAccountProfile } from "@/lib/api/account";
import { createOrder } from "@/lib/api/orders";
import { getStoredToken, getStoredUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useCart } from "@/lib/stores/cart";
import { normalizeImageUrl } from "@/lib/utils/image";
import { formatPrice } from "@/lib/utils/price";
import { CheckoutCanvas } from "./CheckoutCanvas";
import "./checkout.css";

type CheckoutMode = "loading" | "choose" | "guest" | "account";
type DeliveryType = "delivery" | "pickup";
type FieldErrors = Record<string, string[]>;

function phoneDisplay(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  if (!digits) return "";
  const d = digits.startsWith("7") ? digits : `7${digits}`;
  const parts = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let result = "+7";
  if (parts[0]) result += ` (${parts[0]}`;
  if (parts[0].length === 3) result += ")";
  if (parts[1]) result += ` ${parts[1]}`;
  if (parts[2]) result += `-${parts[2]}`;
  if (parts[3]) result += `-${parts[3]}`;
  return result;
}

function plural(value: number) {
  const n10 = value % 10;
  const n100 = value % 100;
  if (n10 === 1 && n100 !== 11) return "товар";
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "товара";
  return "товаров";
}

function createCheckoutToken(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export function CheckoutExperience() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const checkoutTokenRef = useRef<string>("");
  const orderPlacedRef = useRef(false);
  const items = useCart((s) => s.items);
  const totalQty = useCart((s) => s.totalQty());
  const totalPrice = useCart((s) => s.totalPrice());
  const clearCart = useCart((s) => s.clear);

  const [mode, setMode] = useState<CheckoutMode>("loading");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Алматы");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!items.length) {
      if (!orderPlacedRef.current) {
        router.replace("/cart");
      }
      return;
    }

    const token = getStoredToken();
    const stored = getStoredUser();
    if (!token) {
      setMode("choose");
      return;
    }

    setMode("account");
    if (stored) {
      setName(stored.name || "");
      setEmail(stored.email || "");
      setPhone(phoneDisplay(stored.phone || ""));
      setCity(stored.city || "Алматы");
    }

    getAccountProfile(token)
      .then(({ data }) => {
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(phoneDisplay(data.phone || ""));
        setCity(data.city || "Алматы");
        setAddress(data.address || "");
      })
      .catch(() => {
        // Сохранённые данные достаточно хороши для оформления.
      });
  }, [items.length, router]);

  useEffect(() => {
    if (mode === "loading" || !rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        ".etis-checkout-animate",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.065, ease: "power3.out" },
      );
    }, rootRef);
    return () => context.revert();
  }, [mode]);

  const orderItems = useMemo(
    () => items.map((item) => ({ product_id: item.product_id, qty: item.qty })),
    [items],
  );

  const chooseGuest = () => {
    setMode("guest");
    const user = getStoredUser();
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(phoneDisplay(user.phone || ""));
      setCity(user.city || "Алматы");
    }
  };

  const chooseLogin = () => {
    sessionStorage.setItem("etis-auth-return", "/checkout");
    router.push("/login");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setFieldErrors({});

    if (!accepted) {
      setError("Подтвердите согласие на обработку данных.");
      return;
    }

    setSubmitting(true);
    try {
      if (!checkoutTokenRef.current) {
        checkoutTokenRef.current = createCheckoutToken();
      }

      const response = await createOrder(
        {
          checkout_token: checkoutTokenRef.current,
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          city: city.trim(),
          delivery_type: deliveryType,
          address: deliveryType === "delivery" ? address.trim() : undefined,
          comment: comment.trim() || undefined,
          items: orderItems,
        },
        getStoredToken(),
      );

      orderPlacedRef.current = true;
      clearCart();
      const params = new URLSearchParams({
        order: response.data.order_number,
        total: String(response.data.total),
        account: response.data.account_created ? "created" : "existing",
      });
      router.push(`/thank-you?${params.toString()}`);
    } catch (caught) {
      const apiError = caught as ApiError;
      const body = (apiError.body || {}) as { message?: string; errors?: FieldErrors };
      const errors = body.errors || {};
      const firstFieldError = Object.values(errors).flat()[0];

      if (apiError.status === 0) {
        setError("Не удалось связаться с Laravel API. Проверьте, что бэкенд запущен и NEXT_PUBLIC_API_URL указан правильно.");
      } else if (apiError.status === 401) {
        setError("Сессия личного кабинета истекла. Войдите заново и повторите оформление.");
      } else {
        setError(firstFieldError || body.message || "Не удалось оформить заказ. Проверьте данные и повторите попытку.");
      }

      setFieldErrors(errors);
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "loading") return null;

  return (
    <section ref={rootRef} className="etis-checkout-page">
      <div className="container-narrow">
        <nav className="etis-checkout-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link><ChevronRight size={14} />
          <Link href="/cart">Корзина</Link><ChevronRight size={14} />
          <span>Оформление заказа</span>
        </nav>

        <section className="etis-checkout-hero etis-checkout-animate">
          <CheckoutCanvas />
          <div className="etis-checkout-hero__copy">
            <div className="etis-checkout-eyebrow"><span /> ЗАЯВКА. ПРОВЕРКА. ПОСТАВКА.</div>
            <h1>Оформление заказа</h1>
            <p>Оставьте данные — инженер ETIS.KZ проверит комплект, сроки и подготовит точное предложение.</p>
            <div className="etis-checkout-hero__chips">
              <span><ShieldCheck size={15} /> Безопасная передача</span>
              <span><ClipboardCheck size={15} /> Проверка инженером</span>
              <span><Clock3 size={15} /> Ответ в рабочее время</span>
            </div>
          </div>
          <div className="etis-checkout-hero__visual">
            <div className="etis-checkout-hero__logo"><Logo size={34} /></div>
            <div className="etis-checkout-hero__metric"><span>В заказе</span><b>{totalQty} {plural(totalQty)}</b><strong>{formatPrice(totalPrice)}</strong></div>
          </div>
        </section>

        {mode === "choose" ? (
          <section className="etis-checkout-choice etis-checkout-animate">
            <div className="etis-checkout-choice__head">
              <span>Как удобнее продолжить?</span>
              <h2>Выберите способ оформления</h2>
              <p>Можно оформить быстро без входа или использовать сохранённые данные личного кабинета.</p>
            </div>
            <div className="etis-checkout-choice__grid">
              <button type="button" onClick={chooseGuest} className="etis-checkout-choice__card">
                <div className="etis-checkout-choice__icon"><UserRoundPlus size={28} /></div>
                <div><h3>Быстрый заказ</h3><p>Заполните контакты. Для нового e-mail кабинет создастся автоматически.</p></div>
                <ArrowLeft className="is-forward" size={20} />
              </button>
              <button type="button" onClick={chooseLogin} className="etis-checkout-choice__card is-blue">
                <div className="etis-checkout-choice__icon"><LogIn size={28} /></div>
                <div><h3>Войти в кабинет</h3><p>Данные заполнятся автоматически, а заказ появится в истории.</p></div>
                <ArrowLeft className="is-forward" size={20} />
              </button>
            </div>
            <div className="etis-checkout-choice__summary"><ShoppingBag size={18} /><span>{totalQty} {plural(totalQty)}</span><strong>{formatPrice(totalPrice)}</strong></div>
          </section>
        ) : (
          <form onSubmit={submit} className="etis-checkout-layout">
            <div className="etis-checkout-form">
              {mode === "guest" && (
                <button type="button" className="etis-checkout-back-choice etis-checkout-animate" onClick={() => setMode("choose")}>
                  <ArrowLeft size={15} /> Выбрать другой способ
                </button>
              )}

              <section className="etis-checkout-panel etis-checkout-animate">
                <div className="etis-checkout-panel__title"><span><UserRound size={20} /></span><div><b>Контактные данные</b><small>Куда менеджеру отправить расчёт</small></div></div>
                {mode === "guest" && <div className="etis-checkout-note"><Sparkles size={17} /> Для нового e-mail мы создадим личный кабинет и отправим временный пароль.</div>}
                <div className="etis-checkout-fields">
                  <label><span>Имя *</span><div><UserRound size={16} /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" required /></div>{fieldErrors.customer_name && <small>{fieldErrors.customer_name[0]}</small>}</label>
                  <label><span>E-mail *</span><div><Mail size={16} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mail@example.kz" required readOnly={mode === "account"} aria-readonly={mode === "account"} /></div>{fieldErrors.customer_email && <small>{fieldErrors.customer_email[0]}</small>}</label>
                  <label><span>Телефон *</span><div><Phone size={16} /><input value={phone} onChange={(e) => setPhone(phoneDisplay(e.target.value))} placeholder="+7 (___) ___-__-__" required /></div>{fieldErrors.customer_phone && <small>{fieldErrors.customer_phone[0]}</small>}</label>
                  <label><span>Город *</span><div><Building2 size={16} /><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Алматы" required /></div>{fieldErrors.city && <small>{fieldErrors.city[0]}</small>}</label>
                </div>
              </section>

              <section className="etis-checkout-panel etis-checkout-animate">
                <div className="etis-checkout-panel__title"><span><Truck size={20} /></span><div><b>Получение заказа</b><small>Финальные сроки согласует менеджер</small></div></div>
                <div className="etis-delivery-select">
                  <button type="button" data-active={deliveryType === "delivery"} onClick={() => setDeliveryType("delivery")}><span><Truck size={22} /></span><b>Доставка</b><small>По Алматы и Казахстану</small>{deliveryType === "delivery" && <i><Check size={13} /></i>}</button>
                  <button type="button" data-active={deliveryType === "pickup"} onClick={() => setDeliveryType("pickup")}><span><Store size={22} /></span><b>Самовывоз</b><small>Со склада в Алматы</small>{deliveryType === "pickup" && <i><Check size={13} /></i>}</button>
                </div>
                {deliveryType === "delivery" ? (
                  <label className="etis-checkout-wide-field"><span>Адрес доставки *</span><div><MapPin size={16} /><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Улица, дом, офис или объект" required /></div>{fieldErrors.address && <small>{fieldErrors.address[0]}</small>}</label>
                ) : (
                  <div className="etis-pickup-card"><MapPin size={20} /><div><b>Самовывоз в Алматы</b><span>Точный адрес склада и время выдачи менеджер подтвердит после проверки комплекта.</span></div></div>
                )}
              </section>

              <section className="etis-checkout-panel etis-checkout-animate">
                <div className="etis-checkout-panel__title"><span><MessageSquareText size={20} /></span><div><b>Комментарий к заказу</b><small>Параметры объекта, сроки или особые требования</small></div></div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Например: нужен подбор автоматики, монтаж или доставка на объект..." />
              </section>
            </div>

            <aside className="etis-checkout-summary etis-checkout-animate">
              <div className="etis-checkout-summary__eyebrow">ВАШ ЗАКАЗ</div>
              <h2>Состав комплекта</h2>
              <div className="etis-checkout-summary__items">
                {items.map((item) => {
                  const src = normalizeImageUrl(item.thumbnail);
                  return (
                    <div key={item.product_id} className="etis-checkout-summary__item">
                      <div className="etis-checkout-summary__image">{src ? <Image src={src} alt={item.title} fill sizes="76px" className="object-contain" /> : <NoPhoto size={40} />}</div>
                      <div><Link href={`/product/${item.slug}`}>{item.title}</Link><span>{item.qty} × {formatPrice(item.price)}</span></div>
                      <strong>{formatPrice(item.qty * item.price)}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="etis-checkout-summary__rows"><div><span>Количество</span><b>{totalQty} шт.</b></div><div><span>Товары</span><b>{formatPrice(totalPrice)}</b></div><div><span>Доставка</span><b className="is-blue">По согласованию</b></div></div>
              <div className="etis-checkout-summary__total"><span>Предварительно</span><strong>{formatPrice(totalPrice)}</strong><small>Цена и наличие будут повторно проверены на сервере</small></div>
              {error && <div className="etis-checkout-error">{error}</div>}
              <label className="etis-checkout-consent"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /><span><i><Check size={12} /></i>Согласен с политикой конфиденциальности и обработкой данных</span></label>
              <button type="submit" className="etis-checkout-submit" disabled={submitting}><Sparkles size={18} />{submitting ? "Отправляем заявку…" : "Оформить заявку"}</button>
              <a href="tel:+77273280575" className="etis-checkout-phone"><Phone size={16} /> +7 (727) 328 05 75</a>
              <div className="etis-checkout-safe"><ShieldCheck size={20} /><span><b>Безопасное оформление</b>Контакты используются только для обработки заказа.</span></div>
            </aside>
          </form>
        )}
      </div>
    </section>
  );
}
