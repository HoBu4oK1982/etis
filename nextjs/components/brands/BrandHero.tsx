import Link from "next/link";
import { ArrowLeft, BadgeCheck, Layers, Package, Tag } from "lucide-react";
import type { BrandDetail } from "@/lib/types/brand";
import { formatPrice } from "@/lib/utils/price";
import { BrandLogo } from "./BrandLogo";

/**
 * Шапка страницы бренда: логотип, название, агрегаты по ассортименту
 * и краткое описание. Серверный компонент — все цифры уже пришли
 * вместе с товарами, дополнительных запросов не делаем.
 */
export function BrandHero({ brand }: { brand: BrandDetail }) {
  const summary = brand.description ? stripTags(brand.description) : null;

  return (
    <section className="etis-brand-hero">
      <div className="etis-brand-hero__logo">
        <BrandLogo title={brand.title} image={brand.image} sizes="260px" large />
      </div>

      <div className="etis-brand-hero__body">
        <Link href="/brands" className="etis-brand-hero__back">
          <ArrowLeft size={14} strokeWidth={2.6} />
          Все бренды
        </Link>

        <h1 className="etis-brand-hero__title">
          {brand.title}
          <span className="etis-brand-hero__verified" title="Официальный поставщик">
            <BadgeCheck size={20} strokeWidth={2.2} />
          </span>
        </h1>

        {summary && <p className="etis-brand-hero__text">{summary}</p>}

        <div className="etis-brand-hero__stats">
          <div className="etis-brand-hero__stat">
            <Package size={16} strokeWidth={2.2} />
            <b>{brand.products_count.toLocaleString("ru-RU")}</b>
            <span>{plural(brand.products_count, ["товар", "товара", "товаров"])}</span>
          </div>

          {brand.categories_count > 0 && (
            <div className="etis-brand-hero__stat">
              <Layers size={16} strokeWidth={2.2} />
              <b>{brand.categories_count}</b>
              <span>
                {plural(brand.categories_count, ["раздел", "раздела", "разделов"])}
              </span>
            </div>
          )}

          {brand.min_price ? (
            <div className="etis-brand-hero__stat">
              <Tag size={16} strokeWidth={2.2} />
              <span>от</span>
              <b>{formatPrice(brand.min_price)}</b>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}
