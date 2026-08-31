/**
 * Константы сайта для SEO: канонический адрес, данные организации,
 * контакты. Одно место, чтобы JSON-LD, sitemap и OpenGraph не разъезжались.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://etis.kz"
).replace(/\/+$/, "");

export const SITE_NAME = "ETIS.KZ";

export const SITE_DESCRIPTION =
  "B2B платформа отопительного, HVAC и сантехнического оборудования в Казахстане";

/** Телефон отдела продаж — тот же, что в шапке и на странице контактов. */
export const SALES_PHONE = "+77273280575";

export const ORGANIZATION_LOGO = `${SITE_URL}/logo.svg`;

/**
 * Обрезка описания для OpenGraph: соцсети и так показывают ~200 знаков,
 * а длинное описание товара из 1С уезжает на несколько экранов.
 * Режем по границе слова и добавляем многоточие.
 */
export function ogDescription(
  text: string | null | undefined,
  max = 200,
): string | undefined {
  if (!text) return undefined;

  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean || undefined;

  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
