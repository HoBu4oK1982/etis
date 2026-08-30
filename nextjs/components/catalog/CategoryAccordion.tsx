"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { CategoryTreeNode } from "@/lib/types/category";

type Props = {
  /** Корневая категория с вложенными детьми (tree из API) */
  tree: CategoryTreeNode;
  /** Slug корня — с него начинается URL */
  rootSlug: string;
  /** Текущий путь после корня: ["nasosy", "cirkulyacionnye"] */
  pathSegments: string[];
  /** [category_id => товаров в поддереве] */
  counts?: Record<string, number>;
};

/**
 * Аккордеон подкатегорий (2-й уровень и глубже).
 *
 * Ветка, в которой находится текущая категория, раскрыта изначально —
 * пользователь сразу видит, где он и что рядом. Остальные сворачиваются.
 * Ссылки собираются по URL-схеме /category/{root}/{path*}.
 */
export function CategoryAccordion({ tree, rootSlug, pathSegments, counts }: Props) {
  const children = tree?.children ?? [];

  if (children.length === 0) {
    return <p className="etis-cat-empty-note">В этом разделе нет подкатегорий</p>;
  }

  return (
    <div className="etis-acc">
      <Link
        href={`/category/${rootSlug}`}
        className={`etis-acc__item etis-acc__item--root${
          pathSegments.length === 0 ? " is-current" : ""
        }`}
      >
        <span>Все товары раздела</span>
        {counts?.[tree.id] !== undefined && (
          <span className="etis-acc__num">{counts[tree.id]}</span>
        )}
      </Link>

      <ul className="etis-acc__list">
        {children.map((node) => (
          <AccordionNode
            key={node.id}
            node={node}
            rootSlug={rootSlug}
            trail={[]}
            pathSegments={pathSegments}
            counts={counts}
            depth={0}
          />
        ))}
      </ul>
    </div>
  );
}

/* ---------- Узел дерева ---------- */

function AccordionNode({
  node,
  rootSlug,
  trail,
  pathSegments,
  counts,
  depth,
}: {
  node: CategoryTreeNode;
  rootSlug: string;
  trail: string[];
  pathSegments: string[];
  counts?: Record<string, number>;
  depth: number;
}) {
  const currentTrail = [...trail, node.slug];
  const href = `/category/${rootSlug}/${currentTrail.join("/")}`;

  // Узел лежит на текущем пути → ветка раскрыта, заголовок подсвечен
  const onPath = currentTrail.every((seg, i) => pathSegments[i] === seg);
  const isCurrent = onPath && pathSegments.length === currentTrail.length;

  const [open, setOpen] = useState(onPath);

  // На последнем загруженном уровне бэкенд не отдаёт ключ children
  // (whenLoaded), поэтому подстраховываемся: без ?? [] здесь падало
  // «Cannot read properties of undefined (reading 'length')».
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const count = counts?.[node.id];

  return (
    <li
      className={`etis-acc__node${onPath ? " is-path" : ""}`}
      data-depth={Math.min(depth, 3)}
    >
      <div className="etis-acc__row">
        <Link
          href={href}
          className={`etis-acc__item${isCurrent ? " is-current" : ""}${
            onPath && !isCurrent ? " is-parent" : ""
          }`}
        >
          <span>{node.title}</span>
          {count !== undefined && <span className="etis-acc__num">{count}</span>}
        </Link>

        {hasChildren && (
          <button
            type="button"
            className={`etis-acc__toggle${open ? " is-open" : ""}${
              onPath ? " is-path" : ""
            }`}
            aria-label={open ? "Свернуть" : "Развернуть"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.ul
            className={`etis-acc__list etis-acc__list--nested${onPath ? " is-path" : ""}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            {children.map((child) => (
              <AccordionNode
                key={child.id}
                node={child}
                rootSlug={rootSlug}
                trail={currentTrail}
                pathSegments={pathSegments}
                counts={counts}
                depth={depth + 1}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
