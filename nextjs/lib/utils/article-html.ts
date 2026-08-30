import { normalizeRichTextHtml } from "@/lib/utils/image";

/**
 * HTML статьи приходит из доверенной админки, но всё равно убираем опасные
 * конструкции и служебные обёртки DOMDocument (<html><body>...</body></html>).
 */
export function prepareArticleHtml(html: string | null | undefined): string {
  if (!html) return "";

  return normalizeRichTextHtml(html)
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<\/?(?:html|head|body)[^>]*>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"')
    .trim();
}

export function articlePlainText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
