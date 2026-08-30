"use client";

import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils/image";

type Props = {
  title: string;
  image: string | null;
  /** Размеры для next/image (атрибут sizes) */
  sizes?: string;
  /** Крупный вариант — в шапке страницы бренда */
  large?: boolean;
};

/**
 * Логотип бренда. Если картинки нет — рисуем монограмму из первых
 * букв названия: карточки в сетке не должны «проваливаться» пустотой.
 */
export function BrandLogo({ title, image, sizes = "180px", large }: Props) {
  const src = normalizeImageUrl(image);

  if (!src) {
    return (
      <span className={`etis-brand-mono${large ? " etis-brand-mono--lg" : ""}`}>
        {monogram(title)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={title}
      fill
      sizes={sizes}
      className="etis-brand-logo__img"
    />
  );
}

function monogram(title: string): string {
  const words = title.trim().split(/[\s-]+/).filter(Boolean);

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return title.trim().slice(0, 2).toUpperCase();
}
