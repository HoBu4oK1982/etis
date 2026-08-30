"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { Headphones, Tag, Waves, Zap, Gauge, Plug, Wrench, Package, Minus, Plus } from "lucide-react";
import type { Product, ProductAttribute } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils/price";
import { useCart } from "@/lib/stores/cart";
import { useWishlist } from "@/lib/stores/wishlist";
import { useCompare } from "@/lib/stores/compare";
import { useToast } from "@/lib/stores/toast";
import { AddToCartButton } from "./AddToCartButton";
import { ProductOneClick } from "./ProductOneClick";
import { AnimatedIconButton } from "./AnimatedIconButton";
import { ProductBadge } from "./ProductBadge";
import { normalizeImageUrl } from "@/lib/utils/image";
import { flyToCart } from "@/lib/utils/fly-to-cart";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import "./product-purchase-layout.css";

type Props = { product: Product };

export function ProductInfo({ product }: Props) {
  const infoRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef<HTMLSpanElement>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const hasWish = useWishlist((s) => s.has(product.id));
  const toggleCompare = useCompare((s) => s.toggle);
  const hasCompare = useCompare((s) => s.has(product.id));
  const showToast = useToast((s) => s.show);

  const price = product.effective_price ?? product.price ?? 0;
  const canAddToCart = Number.isFinite(Number(price)) && Number(price) > 0;
  const thumbnail = product.images[0]?.url ?? null;
  const normalizedThumbnail = normalizeImageUrl(thumbnail);

  const changeQuantity = (next: number) => {
    const safeQuantity = Math.max(1, Math.min(99, next));
    const direction = safeQuantity > quantity ? 1 : -1;
    setQuantity(safeQuantity);

    if (quantityRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        quantityRef.current,
        { y: direction * 10, opacity: 0.45, scale: 0.88 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }
      );
    }
  };

  const handleAdd = (sourceButton?: HTMLButtonElement) => {
    if (!canAddToCart) return;

    const source =
      sourceButton ??
      addButtonRef.current?.querySelector<HTMLElement>("button") ??
      addButtonRef.current ??
      infoRef.current;
    if (source) flyToCart(source, normalizedThumbnail);

    add({
      product_id: product.id,
      title: product.title,
      slug: product.slug,
      price,
      thumbnail,
    }, quantity);
    showToast("Добавлено в корзину", "cart");
  };

  const wishItem = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    thumbnail,
    price,
    brand: product.brand?.title ?? null,
  };
  const compareItem = {
    ...wishItem,
    attributes: product.attributes.map((a) => ({ name: a.name, value: a.value })),
  };

  const specTiles = product.attributes.slice(0, 4);
  const totalPrice = price * quantity;
  const oldTotalPrice = (product.price ?? 0) * quantity;

  return (
    <div ref={infoRef} className="etis-info">
      {/* Верхняя строка: бренд слева, "В наличии" справа */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-h-[24px]">
          {product.brand && <BrandMark brand={product.brand} />}
        </div>
        {product.status === 0 && <span className="etis-info__stock">В наличии</span>}
      </div>

      {/* Бейдж ремарки — крупный, над заголовком */}
      {product.remark && (
        <div className="mb-3">
          <ProductBadge remark={product.remark} size="lg" />
        </div>
      )}

      <h1 className="etis-info__title">{product.title}</h1>

      {product.short_description && (
        <p className="etis-info__short">{product.short_description}</p>
      )}

      {product.sku && (
        <div className="etis-info__sku">
          <Tag size={14} />
          Артикул: <strong>{product.sku}</strong>
        </div>
      )}

      {/* Цена всегда сверху. Количество и быстрые действия стоят в одной стабильной строке. */}
      <div className="etis-info__purchase">
        <div className="etis-price">
          <div
            className={`etis-price__value${
              product.has_discount && product.price ? " etis-price__value--sale" : ""
            }`}
          >
            {price > 0 ? <AnimatedPrice value={totalPrice} /> : "цена по запросу"}
          </div>
          {product.has_discount && product.price && (
            <div className="etis-price__old"><AnimatedPrice value={oldTotalPrice} /></div>
          )}
          {price > 0 && (
            <div
              className="etis-price__calculation"
              data-visible={quantity > 1 ? "true" : "false"}
              aria-hidden={quantity <= 1}
            >
              {quantity} × {formatPrice(price)}
            </div>
          )}
        </div>

        <div className="etis-info__purchase-controls">
          {price > 0 && (
            <div className="etis-product-qty" aria-label="Количество товара">
              <button
                type="button"
                onClick={() => changeQuantity(quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Уменьшить количество"
              >
                <Minus size={16} />
              </button>
              <span ref={quantityRef}>{String(quantity).padStart(2, "0")}</span>
              <button
                type="button"
                onClick={() => changeQuantity(quantity + 1)}
                disabled={quantity >= 99}
                aria-label="Увеличить количество"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          <div className="etis-info__quick">
            <AnimatedIconButton
              variant="compare"
              active={hasCompare}
              onToggle={() => {
                toggleCompare(compareItem);
                showToast(
                  hasCompare ? "Убрано из сравнения" : "Добавлено к сравнению",
                  "compare",
                );
              }}
              label={hasCompare ? "В сравнении" : "Сравнить"}
              size="md"
            />
            <AnimatedIconButton
              variant="wishlist"
              active={hasWish}
              onToggle={() => {
                toggleWish(wishItem);
                showToast(
                  hasWish ? "Убрано из избранного" : "Добавлено в избранное",
                  "wishlist",
                );
              }}
              label={hasWish ? "В избранном" : "В избранное"}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="etis-info__actions">
        {canAddToCart ? (
          <>
            <div ref={addButtonRef} style={{ display: "contents" }}>
              <AddToCartButton
                onAdd={handleAdd}
                fullWidth
                successLabel={quantity > 1 ? `Добавлено ${quantity} шт.` : "Добавлено"}
              />
            </div>
            <ProductOneClick
              product={product}
              quantity={quantity}
              unitPrice={Number(price)}
              variant="secondary"
            />
          </>
        ) : (
          <ProductOneClick
            product={product}
            quantity={1}
            unitPrice={null}
            variant="primary"
          />
        )}

        <Link href="/contacts" className="etis-info__secondary">
          <Headphones size={18} />
          Получить консультацию
        </Link>
      </div>

      {/* Плитки характеристик */}
      {specTiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {specTiles.map((attr) => (
            <SpecTile key={attr.id} attr={attr} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Плитка ---------- */

function pickAttrIcon(name: string) {
  const k = name.toLowerCase();
  if (/(мощн|power|квт|kw)/.test(k)) return Zap;
  if (/(напор|давл|бар|bar|pressure)/.test(k)) return Gauge;
  if (/(напряж|volt|вольт|в\b)/.test(k)) return Plug;
  if (/(произв|расход|м³|м3|flow)/.test(k)) return Waves;
  if (/(подключ|тип|resistance|материал)/.test(k)) return Wrench;
  return Package;
}

function SpecTile({ attr }: { attr: ProductAttribute }) {
  const Icon = pickAttrIcon(attr.name);
  return (
    <div className="etis-spec-tile">
      <span className="etis-spec-tile__icon">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="etis-spec-tile__label">{attr.name}</div>
        <div className="etis-spec-tile__value truncate">{attr.value}</div>
      </div>
    </div>
  );
}

/* ---------- Бренд: логотип, а при его отсутствии — название ---------- */

function BrandMark({ brand }: { brand: NonNullable<Product["brand"]> }) {
  const logo = normalizeImageUrl(brand.image);

  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="etis-info__brand"
      title={brand.title}
    >
      {logo ? (
        // Image с fill требует родителя с размерами, а логотипы у брендов
        // разной пропорции — поэтому обычный img с ограничением по высоте.
        <Image
          src={logo}
          alt={brand.title}
          width={160}
          height={40}
          className="etis-info__brand-logo"
          unoptimized
        />
      ) : (
        <span className="etis-info__brand-text">{brand.title}</span>
      )}
    </Link>
  );
}
