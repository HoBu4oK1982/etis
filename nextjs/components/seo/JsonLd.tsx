import { SITE_URL } from "@/lib/seo/site";

/**
 * Рендерит JSON-LD в <script type="application/ld+json">.
 *
 * Серверный компонент: разметка попадает в HTML при рендере, поэтому её
 * видят краулеры, которые не выполняют JS.
 *
 * dangerouslySetInnerHTML здесь обязателен — React экранировал бы кавычки
 * в текстовом узле, и Schema.org-валидатор такой JSON не разобрал бы.
 * Экранируем только "<", чтобы содержимое не могло закрыть тег <script>.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** Абсолютный URL — Schema.org требует именно их, относительные не годятся. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export type Crumb = {
  name: string;
  /** Относительный путь или абсолютный URL. У последнего элемента может отсутствовать. */
  url?: string;
};

/**
 * BreadcrumbList из цепочки крошек.
 *
 * position нумеруется с 1. Последнему элементу (текущей странице) item
 * не обязателен — Google разрешает его опускать.
 */
export function breadcrumbList(crumbs: Crumb[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.url ? { item: absoluteUrl(crumb.url) } : {}),
    })),
  };
}
