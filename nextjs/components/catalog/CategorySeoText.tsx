"use client";

import { useId, useState } from "react";

type Props = {
  /** Готовый HTML описания категории (уже прошёл normalizeRichTextHtml). */
  html: string;
  /** Длина текста без тегов — считается на сервере. */
  plainLength: number;
};

/** Порог, после которого текст сворачивается. */
const COLLAPSE_AFTER = 300;

/**
 * SEO-текст под каталогом со сворачиванием.
 *
 * Важно: HTML всегда целиком в DOM, свёрнутое состояние — только CSS-обрезка
 * по высоте. Если резать саму строку, краулер увидит обрезанный текст, и
 * весь смысл SEO-блока теряется.
 */
export function CategorySeoText({ html, plainLength }: Props) {
  const collapsible = plainLength > COLLAPSE_AFTER;
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();

  const collapsed = collapsible && !expanded;

  return (
    <section className="etis-cat-seo">
      <div
        id={bodyId}
        className={`etis-cat-seo__body prose-simple category-description${
          collapsed ? " is-collapsed" : ""
        }`}
        data-rich-text
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {collapsible && (
        <button
          type="button"
          className="etis-cat-seo__toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Свернуть" : "Показать полностью"}
        </button>
      )}
    </section>
  );
}
