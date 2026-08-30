"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, FolderOpen, Bookmark, Newspaper } from "lucide-react";
import type { SearchResultItem } from "@/lib/types/search";
import { normalizeImageUrl } from "@/lib/utils/image";

const TYPE_META: Record<
  string,
  { label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  category: { label: "Категория", Icon: FolderOpen },
  brand:    { label: "Бренд",     Icon: Bookmark },
  article:  { label: "Статья",    Icon: Newspaper },
};

/**
 * Карточка не-товарного результата поиска: категория, бренд, статья.
 * Визуально согласована с <ProductCard>: тот же скругление, hover-эффект,
 * рамка, отступы — только без кнопки "в корзину" и цены.
 */
export function EntityCard({ item }: { item: SearchResultItem }) {
  const meta = TYPE_META[item.type] ?? { label: "Раздел", Icon: FolderOpen };
  const Icon = meta.Icon;
  const image = normalizeImageUrl(item.image);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-xl border border-ink-100 hover:border-brand-500/40 hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Метка типа */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold rounded-md bg-brand-50 text-brand-700">
          <Icon size={12} />
          {meta.label}
        </span>
      </div>

      <Link href={item.url} className="block">
        {/* Картинка */}
        <div className="relative aspect-square bg-ink-50 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-ink-300">
              <Icon size={56} />
            </div>
          )}
        </div>

        {/* Инфо */}
        <div className="p-4">
          <h3 className="font-medium text-sm text-ink-900 line-clamp-2 min-h-[2.5rem] mb-3 group-hover:text-brand-600 transition-colors">
            {item.title}
          </h3>

          <div className="flex items-center justify-between text-brand-600 text-sm font-semibold">
            <span>Перейти</span>
            <ChevronRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
