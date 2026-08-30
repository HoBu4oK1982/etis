import type { SearchResultItem } from "@/lib/types/search";
import type { ProductListItem } from "@/lib/types/product";
import { normalizeImageUrl } from "./image";

/**
 * Достаёт slug из URL, приходящего с бэка ("/product/gazovyi-kotel-steel-85").
 * Работает и для категорий/брендов/статей — берётся последний непустой сегмент.
 */
export function slugFromUrl(url: string): string {
  const clean = (url || "").split("?")[0];
  const parts = clean.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

/**
 * Мапит результат поиска типа "product" в ProductListItem,
 * чтобы отрисовать его существующей карточкой <ProductCard>.
 *
 * Ограничение: в индексе поиска не хранятся все поля товара
 * (нет remark/has_discount/selling_price/brand-объекта/sku).
 * Карточка отрисуется корректно, но без бейджа "Хит/Акция/Новинка"
 * и без бренда сверху. После доработки индексатора (расширения
 * search_documents дополнительными полями) можно будет отдавать
 * полный ProductListItem прямо из бэка.
 */
export function searchItemToProduct(item: SearchResultItem): ProductListItem {
  const price = item.price !== null ? Number(item.price) : null;

  return {
    id: item.id,
    title: item.title,
    slug: slugFromUrl(item.url),
    sku: null,
    price,
    selling_price: null,
    effective_price: price,
    has_discount: false,
    remark: null,
    thumbnail: normalizeImageUrl(item.image),
    brand: null,
    category_id: null,
  };
}
