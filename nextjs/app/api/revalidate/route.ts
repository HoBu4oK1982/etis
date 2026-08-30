import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/revalidate — точечная инвалидация ISR-кэша.
 *
 * Дёргается из Laravel Observers на изменения Product / Category / Brand /
 * Article / Slider. Позволяет админ-панели «пробить» кэш нужных страниц
 * без ручной очистки на фронте: клик по «Сохранить» — и все связанные
 * теги отревалидированы, следующий запрос пойдёт в API и обновит статику.
 *
 * Формат запроса:
 *   POST /api/revalidate
 *   Header X-Revalidate-Secret: <REVALIDATE_SECRET>
 *   Body: { tags?: string[], paths?: string[] }
 *
 * Секрет обязателен: без него любой прохожий мог бы дёргать
 * revalidate и заваливать бэк лишними запросами (тоже DoS-вектор).
 *
 * Ответ 200: { ok: true, revalidated: string[], at: ISO }
 * Ответ 401: если секрет неверный или переменная REVALIDATE_SECRET пуста
 *            (значит фича не сконфигурирована и работать не должна).
 *
 * Динамику принудительно задаём через export const dynamic — иначе
 * этот handler мог бы попасть под prerender и не получать реальный body.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SECRET = process.env.REVALIDATE_SECRET;

// Ограничения на входные данные — защита от паразитных запросов
// с огромными телами или адскими путями.
const MAX_TAGS = 64;
const MAX_TAG_LEN = 200;
const MAX_PATH_LEN = 300;

export async function POST(request: Request) {
  if (!SECRET) {
    return NextResponse.json(
      { ok: false, error: "revalidate is not configured" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const provided =
    request.headers.get("x-revalidate-secret") ?? url.searchParams.get("secret");

  if (provided !== SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const tagsIn = Array.isArray((body as any)?.tags) ? (body as any).tags : [];
  const pathsIn = Array.isArray((body as any)?.paths) ? (body as any).paths : [];

  const revalidated: string[] = [];
  const errors: string[] = [];

  for (const tag of tagsIn.slice(0, MAX_TAGS)) {
    if (typeof tag !== "string") continue;
    const clean = tag.trim();
    if (clean.length === 0 || clean.length > MAX_TAG_LEN) continue;

    try {
      revalidateTag(clean);
      revalidated.push(`tag:${clean}`);
    } catch (e) {
      errors.push(`tag:${clean}: ${(e as Error).message}`);
    }
  }

  for (const path of pathsIn.slice(0, MAX_TAGS)) {
    if (typeof path !== "string") continue;
    const clean = path.trim();
    if (!clean.startsWith("/") || clean.length > MAX_PATH_LEN) continue;

    try {
      revalidatePath(clean);
      revalidated.push(`path:${clean}`);
    } catch (e) {
      errors.push(`path:${clean}: ${(e as Error).message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    revalidated,
    errors: errors.length ? errors : undefined,
    at: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST { tags?: string[], paths?: string[] } with X-Revalidate-Secret header",
  });
}
