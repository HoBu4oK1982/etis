"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Heart,
  Headphones,
  Mail,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import gsap from "gsap";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type MouseEvent,
} from "react";
import { Logo } from "@/components/layout/Logo";
import { NoPhoto } from "@/components/product/NoPhoto";
import { useCart, type CartItem } from "@/lib/stores/cart";
import {
  useCompare,
  type CompareAttribute,
  type CompareItem,
} from "@/lib/stores/compare";
import { useWishlist, type WishlistItem } from "@/lib/stores/wishlist";
import { formatPrice } from "@/lib/utils/price";
import { normalizeImageUrl } from "@/lib/utils/image";
import { flyToCart } from "@/lib/utils/fly-to-cart";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { CommerceCanvas } from "./CommerceCanvas";
import "@/components/product/product-detail.css";
import "./commerce.css";

type CommerceMode = "cart" | "wishlist" | "compare";

type Props = {
  mode: CommerceMode;
};

const MODE_CONTENT: Record<
  CommerceMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyText: string;
  }
> = {
  cart: {
    eyebrow: "ЗАКАЗ. КОМПЛЕКТАЦИЯ. КОНТРОЛЬ.",
    title: "Корзина оборудования",
    description:
      "Соберите комплект, отправьте заявку и получите точный расчёт от инженера ETIS.KZ.",
    emptyTitle: "Корзина пока пуста",
    emptyText:
      "Добавьте оборудование из каталога — выбранные позиции сохранятся здесь.",
  },
  wishlist: {
    eyebrow: "ВЫБОР. ПЛАНИРОВАНИЕ. УДОБСТВО.",
    title: "Избранное",
    description:
      "Сохраняйте подходящее оборудование, возвращайтесь к нему и формируйте заказ без спешки.",
    emptyTitle: "В избранном пока ничего нет",
    emptyText:
      "Нажимайте на сердце в карточках товаров, чтобы не потерять интересные позиции.",
  },
  compare: {
    eyebrow: "ПАРАМЕТРЫ. АНАЛИЗ. РЕШЕНИЕ.",
    title: "Сравнение оборудования",
    description:
      "Сопоставляйте характеристики и выбирайте решение, которое точно подходит вашему объекту.",
    emptyTitle: "Нет товаров для сравнения",
    emptyText:
      "Добавьте несколько товаров через иконку сравнения — характеристики появятся в одной таблице.",
  },
};

function pluralizeProducts(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "товара";
  return "товаров";
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function QuantityPulse({
  value,
  padStart = 0,
}: {
  value: number;
  padStart?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const firstRef = useRef(true);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (firstRef.current) {
      firstRef.current = false;
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(
      element,
      { scale: 1.1 },
      { scale: 1, duration: 0.24, ease: "back.out(2.2)", overwrite: true }
    );
  }, [value]);

  return (
    <span ref={ref} style={{ display: "inline-block", transformOrigin: "50% 50%" }}>
      {String(value).padStart(padStart, "0")}
    </span>
  );
}

function usePageEntrance(rootRef: RefObject<HTMLElement | null>, mounted: boolean) {
  useEffect(() => {
    if (!mounted || !rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(
          ".etis-commerce-hero__copy > *",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.07 },
          0
        )
        .fromTo(
          ".etis-commerce-hero__visual",
          { opacity: 0, x: 28, scale: 0.97 },
          { opacity: 1, x: 0, scale: 1, duration: 0.68 },
          0.08
        )
        .fromTo(
          ".etis-commerce-toolbar",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45 },
          0.28
        )
        .fromTo(
          ".etis-commerce-card, .etis-commerce-summary, .etis-compare-board",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.065 },
          0.34
        );
    }, rootRef);

    return () => context.revert();
  }, [mounted, rootRef]);
}

function animateRemoval(element: HTMLElement | null, onComplete: () => void) {
  if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onComplete();
    return;
  }

  gsap.to(element, {
    opacity: 0,
    x: 34,
    scale: 0.96,
    height: 0,
    minHeight: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    duration: 0.38,
    ease: "power2.inOut",
    onComplete,
  });
}

function animateClear(root: HTMLElement | null, onComplete: () => void) {
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onComplete();
    return;
  }

  const cards = root.querySelectorAll<HTMLElement>("[data-commerce-card]");
  if (!cards.length) {
    onComplete();
    return;
  }

  gsap.to(cards, {
    opacity: 0,
    y: 18,
    scale: 0.97,
    duration: 0.28,
    stagger: 0.035,
    ease: "power2.in",
    onComplete,
  });
}

function PageHero({
  mode,
  count,
  total,
}: {
  mode: CommerceMode;
  count: number;
  total?: number;
}) {
  const content = MODE_CONTENT[mode];

  const visualIcon =
    mode === "cart" ? (
      <ShoppingCart size={34} />
    ) : mode === "wishlist" ? (
      <Heart size={34} />
    ) : (
      <Scale size={34} />
    );

  return (
    <section className="etis-commerce-hero">
      <CommerceCanvas mode={mode} />
      <div className="etis-commerce-hero__glow" aria-hidden="true" />

      <div className="etis-commerce-hero__copy">
        <div className="etis-commerce-eyebrow">
          <span />
          {content.eyebrow}
        </div>
        <h1>{content.title}</h1>
        <p>{content.description}</p>

        <div className="etis-commerce-hero__chips">
          <span>
            <PackageCheck size={15} /> Подбор инженером
          </span>
          <span>
            <ShieldCheck size={15} /> Официальная гарантия
          </span>
          <span>
            <Truck size={15} /> Доставка по Казахстану
          </span>
        </div>
      </div>

      <div className="etis-commerce-hero__visual">
        <div className="etis-commerce-orbit etis-commerce-orbit--one" />
        <div className="etis-commerce-orbit etis-commerce-orbit--two" />
        <div className="etis-commerce-hero__icon">{visualIcon}</div>
        <div className="etis-commerce-hero__metric">
          <span>Сейчас выбрано</span>
          <strong>
            <AnimatedNumber value={count} /> {pluralizeProducts(count)}
          </strong>
          {typeof total === "number" && total > 0 && <b><AnimatedPrice value={total} /></b>}
        </div>
        <div className="etis-commerce-hero__logo">
          <Logo size={25} />
        </div>
      </div>
    </section>
  );
}

function EmptyState({ mode }: { mode: CommerceMode }) {
  const content = MODE_CONTENT[mode];
  const Icon = mode === "cart" ? ShoppingCart : mode === "wishlist" ? Heart : Scale;

  return (
    <section className="etis-commerce-empty">
      <div className="etis-commerce-empty__halo" aria-hidden="true" />
      <div className="etis-commerce-empty__icon">
        <Icon size={44} strokeWidth={1.55} />
        <span className="etis-commerce-empty__ring" />
        <span className="etis-commerce-empty__ring etis-commerce-empty__ring--two" />
      </div>
      <div className="etis-commerce-empty__logo">
        <Logo size={28} />
      </div>
      <h2>{content.emptyTitle}</h2>
      <p>{content.emptyText}</p>
      <Link href="/shop" className="etis-commerce-primary-link">
        Перейти в каталог <ArrowRight size={17} />
      </Link>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="etis-commerce-loading" aria-label="Загрузка выбранных товаров">
      <span />
      <span />
      <span />
    </div>
  );
}

function ProductImage({
  src,
  title,
  sizes,
}: {
  src: string | null;
  title: string;
  sizes: string;
}) {
  const normalized = normalizeImageUrl(src);
  return normalized ? (
    <Image src={normalized} alt={title} fill sizes={sizes} className="object-contain" />
  ) : (
    <NoPhoto size={64} />
  );
}

function CartItemCard({ item }: { item: CartItem }) {
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const cardRef = useRef<HTMLElement>(null);
  const lineTotal = item.price * item.qty;

  const changeQty = (next: number) => {
    setQty(item.product_id, Math.max(1, next));
  };

  return (
    <article ref={cardRef} className="etis-commerce-card etis-cart-item" data-commerce-card>
      <Link href={`/product/${item.slug}`} className="etis-cart-item__image">
        <ProductImage src={item.thumbnail} title={item.title} sizes="180px" />
      </Link>

      <div className="etis-cart-item__content">
        <div className="etis-cart-item__meta">Промышленное оборудование</div>
        <Link href={`/product/${item.slug}`} className="etis-cart-item__title">
          {item.title}
        </Link>
        <div className="etis-cart-item__unit-price">
          {formatPrice(item.price)} <span>за единицу</span>
        </div>

        <div className="etis-cart-item__controls">
          <div className="etis-qty" aria-label="Количество товара">
            <button
              type="button"
              onClick={() => changeQty(item.qty - 1)}
              aria-label="Уменьшить количество"
            >
              <Minus size={15} />
            </button>
            <QuantityPulse value={item.qty} padStart={2} />
            <button
              type="button"
              onClick={() => changeQty(item.qty + 1)}
              aria-label="Увеличить количество"
            >
              <Plus size={15} />
            </button>
          </div>

          <button
            type="button"
            className="etis-commerce-remove"
            onClick={() => animateRemoval(cardRef.current, () => remove(item.product_id))}
          >
            <Trash2 size={15} /> Удалить
          </button>
        </div>
      </div>

      <div className="etis-cart-item__price">
        <span>Сумма</span>
        <strong><AnimatedPrice value={lineTotal} /></strong>
        {item.qty > 1 && <small>{item.qty} × {formatPrice(item.price)}</small>}
      </div>
    </article>
  );
}

function CartView() {
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const totalQty = useCart((state) => state.totalQty());
  const totalPrice = useCart((state) => state.totalPrice());
  const listRef = useRef<HTMLDivElement>(null);

  if (!items.length) return <EmptyState mode="cart" />;

  return (
    <>
      <div className="etis-commerce-toolbar">
        <div>
          <strong>{totalQty} {pluralizeProducts(totalQty)}</strong>
          <span>Проверьте состав заказа перед отправкой заявки</span>
        </div>
        <button type="button" onClick={() => animateClear(listRef.current, clear)}>
          <Trash2 size={15} /> Очистить корзину
        </button>
      </div>

      <div className="etis-cart-layout">
        <div ref={listRef} className="etis-cart-list">
          {items.map((item) => (
            <CartItemCard key={item.product_id} item={item} />
          ))}

          <div className="etis-cart-process">
            <div><span>01</span><b>Заявка</b><small>Отправляете выбранные позиции</small></div>
            <ChevronRight size={18} />
            <div><span>02</span><b>Проверка</b><small>Инженер уточняет характеристики</small></div>
            <ChevronRight size={18} />
            <div><span>03</span><b>Счёт</b><small>Получаете срок и точную стоимость</small></div>
          </div>
        </div>

        <aside className="etis-commerce-summary">
          <div className="etis-commerce-summary__eyebrow">СВОДКА ЗАКАЗА</div>
          <h2>Ваш комплект</h2>

          <div className="etis-commerce-summary__rows">
            <div><span>Количество</span><strong>{totalQty} шт.</strong></div>
            <div><span>Товары</span><strong><AnimatedPrice value={totalPrice} /></strong></div>
            <div><span>Доставка</span><strong className="is-blue">По согласованию</strong></div>
          </div>

          <div className="etis-commerce-summary__total">
            <span>Предварительно</span>
            <strong><AnimatedPrice value={totalPrice} /></strong>
            <small>Финальная стоимость подтверждается менеджером</small>
          </div>

          <Link href="/checkout" className="etis-commerce-checkout">
            <Sparkles size={18} /> Оформить заявку
          </Link>
          <a href="tel:+77273280575" className="etis-commerce-contact-link">
            <Phone size={16} /> +7 (727) 328 05 75
          </a>

          <div className="etis-commerce-summary__safe">
            <ShieldCheck size={20} />
            <span><b>Безопасная заявка</b>Ваши данные используются только для расчёта заказа.</span>
          </div>
        </aside>
      </div>
    </>
  );
}

function WishlistCard({ item }: { item: WishlistItem }) {
  const remove = useWishlist((state) => state.remove);
  const addToCart = useCart((state) => state.add);
  const toggleCompare = useCompare((state) => state.toggle);
  const isCompared = useCompare((state) => state.has(item.id));
  const cardRef = useRef<HTMLElement>(null);
  const numericPrice = Number(item.price);
  const canAddToCart = Number.isFinite(numericPrice) && numericPrice > 0;

  const add = (event: MouseEvent<HTMLButtonElement>) => {
    const productId = Number(item.id);

    if (!canAddToCart || !Number.isFinite(productId) || productId <= 0) return;

    // В избранном анимация также стартует из самой кнопки.
    flyToCart(event.currentTarget, normalizeImageUrl(item.thumbnail));

    addToCart({
      product_id: productId,
      title: item.title,
      slug: item.slug,
      price: numericPrice,
      thumbnail: item.thumbnail,
    });

    animateRemoval(cardRef.current, () => remove(item.id));
  };

  const compareItem: CompareItem = {
    ...item,
    attributes: [],
  };

  return (
    <article ref={cardRef} className="etis-commerce-card etis-wish-card" data-commerce-card>
      <div className="etis-wish-card__media">
        <Link href={`/product/${item.slug}`}>
          <ProductImage src={item.thumbnail} title={item.title} sizes="320px" />
        </Link>
        <span className="etis-wish-card__stock"><i /> В наличии</span>
        <button
          type="button"
          className="etis-wish-card__remove"
          aria-label="Удалить из избранного"
          onClick={() => animateRemoval(cardRef.current, () => remove(item.id))}
        >
          <X size={17} />
        </button>
      </div>

      <div className="etis-wish-card__body">
        <div className="etis-wish-card__brand">{item.brand || "ETIS.KZ"}</div>
        <Link href={`/product/${item.slug}`} className="etis-wish-card__title">
          {item.title}
        </Link>
        <div className="etis-wish-card__price">
          {item.price > 0 ? formatPrice(item.price) : "Цена по запросу"}
        </div>

        <div className="etis-wish-card__actions">
          {canAddToCart && (
            <button
              type="button"
              className="etis-wish-card__cart"
              onClick={add}
            >
              <ShoppingCart size={17} />
              В корзину
            </button>
          )}
          <button
            type="button"
            className="etis-wish-card__compare"
            data-active={isCompared ? "true" : "false"}
            onClick={() => toggleCompare(compareItem)}
            aria-label={isCompared ? "Убрать из сравнения" : "Добавить в сравнение"}
          >
            {isCompared ? <CheckCircle2 size={18} /> : <Scale size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
}

function WishlistView() {
  const items = useWishlist((state) => state.items);
  const clear = useWishlist((state) => state.clear);
  const gridRef = useRef<HTMLDivElement>(null);

  if (!items.length) return <EmptyState mode="wishlist" />;

  return (
    <>
      <div className="etis-commerce-toolbar">
        <div>
          <strong>{items.length} {pluralizeProducts(items.length)}</strong>
          <span>Сохранённые позиции доступны на этом устройстве</span>
        </div>
        <button type="button" onClick={() => animateClear(gridRef.current, clear)}>
          <Trash2 size={15} /> Очистить избранное
        </button>
      </div>

      <div ref={gridRef} className="etis-wishlist-grid">
        {items.map((item) => <WishlistCard key={item.id} item={item} />)}
      </div>

      <ContactStrip
        icon={<Headphones size={24} />}
        title="Не уверены, какое оборудование выбрать?"
        text="Отправьте список инженеру ETIS.KZ — проверим совместимость и предложим оптимальный комплект."
      />
    </>
  );
}

function CompareProductCard({ item }: { item: CompareItem }) {
  const remove = useCompare((state) => state.remove);
  const addToCart = useCart((state) => state.add);
  const toggleWish = useWishlist((state) => state.toggle);
  const wished = useWishlist((state) => state.has(item.id));
  const cardRef = useRef<HTMLDivElement>(null);
  const numericPrice = Number(item.price);
  const canAddToCart = Number.isFinite(numericPrice) && numericPrice > 0;

  const wishlistItem: WishlistItem = {
    id: item.id,
    title: item.title,
    slug: item.slug,
    thumbnail: item.thumbnail,
    price: item.price,
    brand: item.brand,
  };

  return (
    <div ref={cardRef} className="etis-compare-product" data-commerce-card>
      <button
        type="button"
        className="etis-compare-product__remove"
        onClick={() => animateRemoval(cardRef.current, () => remove(item.id))}
        aria-label="Убрать товар из сравнения"
      >
        <X size={16} />
      </button>
      <Link href={`/product/${item.slug}`} className="etis-compare-product__image">
        <ProductImage src={item.thumbnail} title={item.title} sizes="230px" />
      </Link>
      <div className="etis-compare-product__brand">{item.brand || "ETIS.KZ"}</div>
      <Link href={`/product/${item.slug}`} className="etis-compare-product__title">
        {item.title}
      </Link>
      <div className="etis-compare-product__price">
        {item.price > 0 ? formatPrice(item.price) : "Цена по запросу"}
      </div>
      <div className="etis-compare-product__actions">
        {canAddToCart && (
          <button
            type="button"
            className="etis-compare-product__cart"
            onClick={() =>
              addToCart({
                product_id: item.id,
                title: item.title,
                slug: item.slug,
                price: numericPrice,
                thumbnail: item.thumbnail,
              })
            }
          >
            <ShoppingCart size={16} /> В корзину
          </button>
        )}
        <button
          type="button"
          className="etis-compare-product__wish"
          data-active={wished ? "true" : "false"}
          onClick={() => toggleWish(wishlistItem)}
          aria-label={wished ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Heart size={17} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

function CompareView() {
  const items = useCompare((state) => state.items);
  const clear = useCompare((state) => state.clear);
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const attributeNames = useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();
    items.forEach((item) => {
      item.attributes.forEach((attribute) => {
        if (!seen.has(attribute.name)) {
          seen.add(attribute.name);
          names.push(attribute.name);
        }
      });
    });
    return names;
  }, [items]);

  const visibleAttributes = useMemo(() => {
    if (!differencesOnly || items.length < 2) return attributeNames;
    return attributeNames.filter((name) => {
      const values = items.map(
        (item) => item.attributes.find((attribute) => attribute.name === name)?.value || "—"
      );
      return new Set(values).size > 1;
    });
  }, [attributeNames, differencesOnly, items]);

  if (!items.length) return <EmptyState mode="compare" />;

  const columns = `220px repeat(${items.length}, minmax(238px, 1fr))`;

  return (
    <>
      <div className="etis-commerce-toolbar etis-commerce-toolbar--compare">
        <div>
          <strong>{items.length} {pluralizeProducts(items.length)}</strong>
          <span>Можно сравнить до четырёх позиций одновременно</span>
        </div>
        <div className="etis-compare-tools">
          <label className="etis-difference-switch">
            <input
              type="checkbox"
              checked={differencesOnly}
              onChange={(event) => setDifferencesOnly(event.target.checked)}
            />
            <span className="etis-difference-switch__track"><i /></span>
            Только различия
          </label>
          <button type="button" onClick={() => animateClear(boardRef.current, clear)}>
            <Trash2 size={15} /> Очистить
          </button>
        </div>
      </div>

      <div ref={boardRef} className="etis-compare-board">
        <div className="etis-compare-scroll">
          <div className="etis-compare-grid" style={{ gridTemplateColumns: columns }}>
            <div className="etis-compare-corner">
              <Scale size={26} />
              <strong>Сравнение</strong>
              <span>Прокрутите таблицу по горизонтали</span>
            </div>
            {items.map((item) => <CompareProductCard key={item.id} item={item} />)}

            {visibleAttributes.map((name, rowIndex) => (
              <CompareRow key={name} name={name} items={items} odd={rowIndex % 2 === 1} />
            ))}

            {!visibleAttributes.length && (
              <>
                <div className="etis-compare-label">Характеристики</div>
                <div className="etis-compare-empty-row" style={{ gridColumn: `span ${items.length}` }}>
                  {differencesOnly
                    ? "У выбранных товаров нет отличающихся заполненных характеристик."
                    : "Характеристики для выбранных товаров пока не заполнены."}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ContactStrip
        icon={<Scale size={24} />}
        title="Нужна помощь с техническим сравнением?"
        text="Инженер проверит рабочие точки, подключение и совместимость оборудования с вашим проектом."
      />
    </>
  );
}

function CompareRow({
  name,
  items,
  odd,
}: {
  name: string;
  items: CompareItem[];
  odd: boolean;
}) {
  return (
    <>
      <div className="etis-compare-label" data-odd={odd ? "true" : "false"}>{name}</div>
      {items.map((item) => {
        const value = item.attributes.find((attribute: CompareAttribute) => attribute.name === name)?.value;
        return (
          <div key={`${name}-${item.id}`} className="etis-compare-value" data-odd={odd ? "true" : "false"}>
            {value || <span>—</span>}
          </div>
        );
      })}
    </>
  );
}

function ContactStrip({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <section className="etis-commerce-contact-strip">
      <div className="etis-commerce-contact-strip__icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="etis-commerce-contact-strip__actions">
        <a href="tel:+77273280575"><Phone size={16} /> Позвонить</a>
        <a href="mailto:info@etis.kz"><Mail size={16} /> Написать</a>
      </div>
    </section>
  );
}

export function CommerceExperience({ mode }: Props) {
  const mounted = useMounted();
  const rootRef = useRef<HTMLElement>(null);

  const cartItems = useCart((state) => state.items);
  const cartTotal = useCart((state) => state.totalPrice());
  const wishlistItems = useWishlist((state) => state.items);
  const compareItems = useCompare((state) => state.items);

  const count =
    mode === "cart"
      ? cartItems.reduce((sum, item) => sum + item.qty, 0)
      : mode === "wishlist"
        ? wishlistItems.length
        : compareItems.length;

  usePageEntrance(rootRef, mounted);

  return (
    <section ref={rootRef} className={`etis-commerce-page etis-commerce-page--${mode}`}>
      <div className="container-narrow">
        <nav className="etis-commerce-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <ChevronRight size={14} />
          <span>{MODE_CONTENT[mode].title}</span>
        </nav>

        <PageHero mode={mode} count={mounted ? count : 0} total={mode === "cart" && mounted ? cartTotal : undefined} />

        {!mounted ? (
          <LoadingState />
        ) : mode === "cart" ? (
          <CartView />
        ) : mode === "wishlist" ? (
          <WishlistView />
        ) : (
          <CompareView />
        )}
      </div>
    </section>
  );
}
