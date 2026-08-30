"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BrandListItem } from "@/lib/types/brand";
import { BrandLogo } from "./BrandLogo";

/**
 * Плитка бренда в сетке /brands.
 *
 * Логотип живёт на белой «подложке» — у большинства производителей
 * логотипы сделаны под светлый фон, и в тёмной теме они бы утонули.
 */
export function BrandCard({ brand }: { brand: BrandListItem }) {
  const empty = brand.products_count === 0;

  return (
    <Link
      href={`/brands/${brand.slug}`}
      className={`etis-brand-card${empty ? " is-empty" : ""}`}
    >
      <span className="etis-brand-card__glow" aria-hidden="true" />

      <span className="etis-brand-card__logo">
        <BrandLogo
          title={brand.title}
          image={brand.image}
          sizes="(max-width: 767px) 40vw, 200px"
        />
      </span>

      <span className="etis-brand-card__body">
        <span className="etis-brand-card__title">{brand.title}</span>

        {brand.description && (
          <span className="etis-brand-card__desc">{stripTags(brand.description)}</span>
        )}
      </span>

      <span className="etis-brand-card__foot">
        <span className="etis-brand-card__count">
          {empty ? "Скоро в продаже" : `${brand.products_count} товаров`}
        </span>
        <span className="etis-brand-card__arrow">
          <ArrowUpRight size={16} strokeWidth={2.6} />
        </span>
      </span>
    </Link>
  );
}

/** Описание приходит из Summernote — в карточке нужен чистый текст. */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
