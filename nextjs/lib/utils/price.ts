/**
 * Валюта проекта — Kazakhstan Tenge (KZT).
 *
 * Один источник истины: если когда-нибудь понадобится сменить валюту
 * (или поддержать мультивалютность), меняем ЗДЕСЬ, а не тремя отдельными
 * строками с обозначением валюты по всему коду. Из-за раздельных строк как раз и вылезают
 * казусы вроде рубля в карточке при тенге на детальной.
 */
export const CURRENCY_SYMBOL = "тг";
export const CURRENCY_CODE = "KZT";

/**
 * Форматирует число как денежную сумму в валюте проекта.
 *   5000  → "5 000 тг"
 *   null  → ""
 *   "abc" → ""
 *
 * Формат числа — «по-русски»: разряды разделены неразрывным пробелом
 * (U+00A0), десятичные округлены до целого. Символ валюты берётся
 * из CURRENCY_SYMBOL — нигде в коде не хардкодим обозначение валюты отдельной строкой.
 */
export function formatPrice(value: number | string | null | undefined): string {
  const formatted = formatNumber(value);
  if (formatted === "") return "";
  return `${formatted} ${CURRENCY_SYMBOL}`;
}

/**
 * Только число без валюты — для мест, где символ рисуется отдельно
 * (например, обёрнут в свой <span> с меньшим кеглем).
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return "";

  return Math.round(n)
    .toLocaleString("ru-RU")
    .replace(/,/g, "\u00A0"); // единообразно неразрывный пробел
}
