"use client";

import Link from "next/link";
import Image from "next/image";
import { Waves, Zap, Gauge, Plug, Wrench, Package, type LucideIcon } from "lucide-react";
import type { ProductListItem } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils/price";
import { useCart } from "@/lib/stores/cart";
import { useWishlist } from "@/lib/stores/wishlist";
import { useCompare } from "@/lib/stores/compare";
import { useToast } from "@/lib/stores/toast";
import { normalizeImageUrl } from "@/lib/utils/image";
import { flyToCart } from "@/lib/utils/fly-to-cart";
import { ProductBadge } from "./ProductBadge";
import { AddToCartButton } from "./AddToCartButton";
import { AnimatedIconButton } from "./AnimatedIconButton";
import { NoPhoto } from "./NoPhoto";

/**
 * Опциональные "превью-атрибуты": первые 2-3 характеристики товара,
 * если бэкенд их отдаёт для карточки в списке.
 *
 * Сейчас ProductListResource на бэке не отдаёт атрибуты — они есть только
 * в полной ProductResource. Чтобы плитки появились на карточках в сетках,
 * достаточно добавить в ProductListResource поле preview_attributes:
 *   [
 *     ['name' => 'Производительность', 'value' => '12 м³/ч'],
 *     ['name' => 'Напор', 'value' => '38 м'],
 *     ['name' => 'Мощность', 'value' => '5.5 кВт'],
 *   ]
 * и одноимённое поле в ProductListItem (types/product.ts). Компонент
 * автоматически подхватит.
 */
type PreviewAttr = { name: string; value: string };

type Props = {
  product: ProductListItem & { preview_attributes?: PreviewAttr[] };
  /** Компактная карточка для секций главной — прячет плитки характеристик. */
  compact?: boolean;
  /** Вид карточки в каталоге: обычная плитка или горизонтальная строка. */
  layout?: "grid" | "list";
};

export function ProductCard({ product, compact, layout = "grid" }: Props) {
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const hasWish = useWishlist((s) => s.has(product.id));
  const toggleCompare = useCompare((s) => s.toggle);
  const hasCompare = useCompare((s) => s.has(product.id));
  const showToast = useToast((s) => s.show);

  const price = product.effective_price ?? product.price ?? 0;
  const canAddToCart = Number.isFinite(Number(price)) && Number(price) > 0;
  const thumbnail = normalizeImageUrl(product.thumbnail);
  const attrs = product.preview_attributes?.slice(0, 3) ?? [];

  const handleAdd = (sourceButton: HTMLButtonElement) => {
    if (!canAddToCart) return;
    // Миниатюра стартует строго из нажатой кнопки «В корзину».
    // Поэтому эффект остаётся видимым на телефоне, даже когда картинка
    // товара находится выше и уже вышла за пределы экрана.
    flyToCart(sourceButton, thumbnail);
    add({
      product_id: product.id,
      title: product.title,
      slug: product.slug,
      price,
      thumbnail: product.thumbnail,
    });
    showToast("Добавлено в корзину", "cart");
  };

  const wishItem = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    thumbnail: product.thumbnail,
    price,
    brand: product.brand?.title ?? null,
  };

  return (
    <article className={`etis-card group${layout === "list" ? " etis-card--list" : ""}`}>
      {/* ---------- Верхний блок: картинка + бейджи ---------- */}
      <div className="etis-card__media">
        <div className="etis-card__badges">
          {product.remark && <ProductBadge remark={product.remark} size="md" />}
        </div>

        <div className="etis-card__stock">
          <span className="etis-card__stock-dot" />
          В наличии
        </div>

        <Link href={`/product/${product.slug}`} className="etis-card__media-link">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={product.title}
              fill
              sizes={
                layout === "list"
                  ? "(max-width: 767px) 100vw, 240px"
                  : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              }
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <NoPhoto size={92} />
          )}
        </Link>
      </div>

      {/* ---------- Нижний блок: инфо ---------- */}
      <div className="etis-card__body">
        {/* Бренд + иконки Избранное / Сравнение */}
        <div className="etis-card__meta flex items-start justify-between gap-3 mb-3">
          {product.brand ? (
            <Link
              href={`/brands/${product.brand.slug}`}
              className="etis-card__brand"
              title={product.brand.title}
            >
              {normalizeImageUrl(product.brand.image) ? (
                <Image
                  src={normalizeImageUrl(product.brand.image) as string}
                  alt={product.brand.title}
                  width={140}
                  height={36}
                  className="etis-card__brand-logo"
                  unoptimized
                />
              ) : (
                <span className="etis-card__brand-text">{product.brand.title}</span>
              )}
            </Link>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
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
              size="sm"
            />
            <AnimatedIconButton
              variant="compare"
              active={hasCompare}
              onToggle={() => {
                toggleCompare({
                  ...wishItem,
                  attributes: attrs,
                });
                showToast(
                  hasCompare ? "Убрано из сравнения" : "Добавлено к сравнению",
                  "compare",
                );
              }}
              size="sm"
            />
          </div>
        </div>

        {/* Название */}
        <Link
          href={`/product/${product.slug}`}
          className="etis-card__title"
        >
          {product.title}
        </Link>

        {/* Плитки характеристик — только если пришли и не compact */}
        {!compact && attrs.length > 0 && (
          <ul className="etis-card__attrs">
            {attrs.map((a) => (
              <AttrRow key={a.name} attr={a} />
            ))}
          </ul>
        )}

        {/* Цена + кнопка */}
        <div className="etis-card__bottom">
          <div className="etis-card__price">
            {product.has_discount && product.price ? (
              <>
                <div className="etis-card__price-old">{formatPrice(product.price)}</div>
                <div className="etis-card__price-value etis-card__price-value--sale">
                  {formatPrice(product.selling_price)}
                </div>
              </>
            ) : (
              <div
                className="etis-card__price-value"
                data-request={price > 0 ? undefined : ""}
              >
                {price > 0 ? formatPrice(price) : "Цена по запросу"}
              </div>
            )}
          </div>

          <AddToCartButton
            onAdd={handleAdd}
            label="В корзину"
            disabled={!canAddToCart}
            disabledTitle="Цена предоставляется по запросу"
          />
        </div>
      </div>
    </article>
  );
}

/* ---------- Плитка "иконка + характеристика" ---------- */

function pickAttrIcon(name: string): LucideIcon {
  const k = name.toLowerCase();
  if (/(мощн|power|квт|kw)/.test(k)) return Zap;
  if (/(напор|давл|бар|bar|pressure)/.test(k)) return Gauge;
  if (/(напряж|volt|вольт|в\b)/.test(k)) return Plug;
  if (/(произв|расход|м³|м3|flow)/.test(k)) return Waves;
  if (/(подключ|тип|материал)/.test(k)) return Wrench;
  return Package;
}

function AttrRow({ attr }: { attr: PreviewAttr }) {
  const Icon = pickAttrIcon(attr.name);
  return (
    <li className="etis-card__attr">
      <span className="etis-card__attr-icon">
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <span className="etis-card__attr-name">{attr.name}</span>
      <span className="etis-card__attr-value">{attr.value}</span>
    </li>
  );
}
