/**
 * Нормализация URL картинок, приходящих из Laravel API.
 *
 * Проблема: в dev у Laravel в .env обычно стоит APP_URL=http://localhost
 * (без порта), потому что OSPanel обслуживает домены на 80-м порту.
 * Но фронт стучится в Laravel на :8000 (php artisan serve), и там же
 * лежат картинки в public/assets/images/... — то есть нужен порт.
 *
 * asset('assets/images/...') в Laravel строит URL от APP_URL, поэтому
 * возвращает "http://localhost/assets/images/..." (без порта).
 * next/image в этот URL стучаться не разрешает (не совпадает с
 * remotePatterns), обычный <img> тоже отваливается: браузер идёт
 * на 80-й порт, где ничего нет.
 *
 * Решение: на лету заменяем localhost/127.0.0.1 (с портом или без)
 * на NEXT_PUBLIC_BACKEND_URL — там всегда правильный хост:порт.
 * В проде картинки уже приходят с https://etis.kz/... — их не трогаем.
 *
 * Рекомендация: параллельно поправить в Laravel .env
 *   APP_URL=http://localhost:8000
 * и запустить `php artisan search:reindex` — тогда индекс сразу с
 * правильными URL и эта нормализация станет ненужной. Но пусть остаётся
 * как страховка на случай неправильной конфигурации в проде.
 */

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://127.0.0.1:8000/api/v1";

/**
 * Базовый URL Laravel без /api/v1. В production это будет https://etis.kz,
 * локально — http://127.0.0.1:8000. NEXT_PUBLIC_BACKEND_URL имеет
 * приоритет, если медиа вынесены на отдельный домен/CDN.
 */
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  RAW_API_URL.replace(/\/api\/v\d+(?:\/.*)?$/i, "")
).replace(/\/+$/, "");

export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const value = url.trim();
  if (!value) return null;

  // Встроенные и временные изображения не переписываем.
  if (/^(?:data:|blob:)/i.test(value)) return value;

  // Protocol-relative URL.
  if (value.startsWith("//")) return `https:${value}`;

  // Абсолютный URL с localhost/127.0.0.1 — переклеиваем на Laravel.
  if (/^https?:\/\//i.test(value)) {
    return value
      .replace(/^https?:\/\/localhost(?::\d+)?/i, BACKEND_URL)
      .replace(/^https?:\/\/127\.0\.0\.1(?::\d+)?/i, BACKEND_URL);
  }

  // Любой относительный путь из HTML админки (/uploads/... или uploads/...).
  return `${BACKEND_URL}/${value.replace(/^\/+/, "")}`;
}

/**
 * Исправляет URL изображений внутри HTML, который приходит из Laravel/Summernote.
 * Без этого src="/uploads/..." браузер запрашивает у Next.js (:3000), а файл
 * физически лежит у Laravel (:8000), из-за чего появляется битая картинка.
 */
export function normalizeRichTextHtml(html: string | null | undefined): string {
  if (!html) return "";

  return html
    .replace(
      /(\s(?:src|data-src)\s*=\s*["'])([^"']+)(["'])/gi,
      (_match, before: string, url: string, after: string) => {
        const normalized = normalizeImageUrl(url);
        return `${before}${normalized ?? url}${after}`;
      },
    )
    .replace(
      /(\ssrcset\s*=\s*["'])([^"']+)(["'])/gi,
      (_match, before: string, value: string, after: string) => {
        const normalized = value
          .split(",")
          .map((candidate) => {
            const parts = candidate.trim().split(/\s+/);
            const url = normalizeImageUrl(parts[0]) ?? parts[0];
            return [url, ...parts.slice(1)].join(" ");
          })
          .join(", ");
        return `${before}${normalized}${after}`;
      },
    );
}
