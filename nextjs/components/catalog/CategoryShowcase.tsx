"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cog,
  Droplet,
  Fan,
  Flame,
  Gauge,
  PencilRuler,
  Snowflake,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { CategoryTile } from "@/lib/types/catalog";
import { normalizeImageUrl } from "@/lib/utils/image";

const CHILDREN_LIMIT = 4;

/**
 * Категории верхнего уровня — содержимое страницы /shop.
 *
 * Плитка ведёт на /category/{slug}, подкатегории — на
 * /category/{root}/{child}. URL-структура сохранена 1:1 со старым сайтом.
 */
export function CategoryShowcase({ categories }: { categories: CategoryTile[] }) {
  if (categories.length === 0) {
    return (
      <p className="etis-cat-showcase__empty">
        Категории пока не заполнены. Проверьте статус разделов в админ-панели.
      </p>
    );
  }

  return (
    <motion.div
      className="etis-cat-showcase__grid"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {categories.map((cat) => (
        <motion.div
          key={cat.id}
          variants={{
            hidden: { opacity: 0, y: 26 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <article className="etis-cat-tile">
            <span className="etis-cat-tile__count">{cat.products_count} шт.</span>

            <div className="etis-cat-tile__body">
              <h2 className="etis-cat-tile__title">
                <Link href={`/category/${cat.slug}`}>{cat.title}</Link>
              </h2>

              {cat.subtitle && <p className="etis-cat-tile__subtitle">{cat.subtitle}</p>}

              {cat.short_description && (
                <p className="etis-cat-tile__desc">{cat.short_description}</p>
              )}

              {cat.children.length > 0 && (
                <ul className="etis-cat-tile__children">
                  {cat.children.slice(0, CHILDREN_LIMIT).map((child) => (
                    <li key={child.id}>
                      <Link href={`/category/${cat.slug}/${child.slug}`}>{child.title}</Link>
                    </li>
                  ))}

                  {cat.children.length > CHILDREN_LIMIT && (
                    <li>
                      <Link href={`/category/${cat.slug}`} className="is-rest">
                        +{cat.children.length - CHILDREN_LIMIT}
                      </Link>
                    </li>
                  )}
                </ul>
              )}

              <Link href={`/category/${cat.slug}`} className="etis-cat-tile__more">
                Перейти в раздел
                <ArrowRight size={16} strokeWidth={2.4} />
              </Link>
            </div>

            {/* Картинка — крупная, в правом нижнем углу, как на главной */}
            <CategoryMedia category={cat} />
          </article>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ---------- Картинка категории или тематическая иконка ---------- */

function pickCategoryIcon(title: string): LucideIcon {
  const k = title.toLowerCase();
  if (/(котл|отоплен|радиатор|тепл|горелк)/.test(k)) return Flame;
  if (/(кондиц|сплит|холод|чиллер)/.test(k)) return Snowflake;
  if (/(вентиляц|рекуператор|воздух)/.test(k)) return Wind;
  if (/(насос|водоснаб|вода|скважин)/.test(k)) return Droplet;
  if (/(фильтр|очистк|умягч)/.test(k)) return Gauge;
  if (/(вытяж|вытяжн|канальн)/.test(k)) return Fan;
  if (/(труб|фитинг|арматур|запорн)/.test(k)) return Wrench;
  if (/(проект|монтаж|услуг)/.test(k)) return PencilRuler;
  return Cog;
}

function CategoryMedia({ category }: { category: CategoryTile }) {
  const src = normalizeImageUrl(category.image);
  const Icon = pickCategoryIcon(category.title);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="etis-cat-tile__media"
      aria-label={`${category.title} — открыть раздел`}
    >
      {src ? (
        <Image
          src={src}
          alt={category.title}
          fill
          sizes="(max-width: 767px) 45vw, 220px"
          className="etis-cat-tile__img"
        />
      ) : (
        <span className="etis-cat-tile__icon">
          <Icon size={64} strokeWidth={1.3} />
        </span>
      )}
    </Link>
  );
}
