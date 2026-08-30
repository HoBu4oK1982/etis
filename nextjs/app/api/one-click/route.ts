import { NextRequest, NextResponse } from "next/server";
import { isSmtpConfigured, sendMail } from "@/lib/mail/smtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  name?: unknown;
  phone?: unknown;
  website?: unknown;
  startedAt?: unknown;
  productId?: unknown;
  productTitle?: unknown;
  productSlug?: unknown;
  productSku?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
  totalPrice?: unknown;
  page?: unknown;
};

type RateEntry = { count: number; resetAt: number };
type Globals = typeof globalThis & {
  __etisOneClickRateLimit?: Map<string, RateEntry>;
};

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const globals = globalThis as Globals;
const rateLimit =
  globals.__etisOneClickRateLimit ?? new Map<string, RateEntry>();
globals.__etisOneClickRateLimit = rateLimit;

function text(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

function number(value: unknown) {
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (symbol) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;",
      })[symbol] || symbol,
  );
}

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 10) digits = `7${digits}`;
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  return digits;
}

function formatPhone(value: string) {
  const digits = normalizePhone(value);
  if (digits.length !== 11) return value;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

function formatMoney(value: number | null) {
  if (value === null || value <= 0) return "Цена по запросу";
  return `${new Intl.NumberFormat("ru-RU").format(value)} тг`;
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  const current = rateLimit.get(key);

  if (!current || current.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_MAX_REQUESTS) return false;
  current.count += 1;
  rateLimit.set(key, current);
  return true;
}

function originIsAllowed(request: NextRequest) {
  const configured = (process.env.CALLBACK_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (configured.length === 0) return true;
  const origin = request.headers.get("origin");
  return !origin || configured.includes(origin);
}

export async function POST(request: NextRequest) {
  if (!originIsAllowed(request)) {
    return NextResponse.json(
      { ok: false, message: "Запрос с этого домена запрещён." },
      { status: 403 },
    );
  }

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Некорректный формат запроса." },
      { status: 400 },
    );
  }

  // Honeypot
  if (text(payload.website, 160)) {
    return NextResponse.json({ ok: true, message: "Спасибо! Заявка принята." });
  }

  // Timing
  const startedAt = Number(payload.startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < 700) {
    return NextResponse.json({ ok: true, message: "Спасибо! Заявка принята." });
  }

  const name = text(payload.name, 80);
  const phoneDigits = normalizePhone(text(payload.phone, 40));
  const productTitle = text(payload.productTitle, 220);
  const productSlug = text(payload.productSlug, 180);
  const productSku = text(payload.productSku, 80);
  const productId = text(String(payload.productId ?? ""), 40);
  const page = text(payload.page, 500);
  const quantity = Math.max(
    1,
    Math.min(99, Math.round(number(payload.quantity) ?? 1)),
  );
  const unitPrice = number(payload.unitPrice);
  const totalPrice = number(payload.totalPrice);

  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "Укажите имя";
  if (phoneDigits.length !== 11 || !phoneDigits.startsWith("7")) {
    fields.phone = "Введите корректный номер телефона";
  }
  if (!productTitle) {
    return NextResponse.json(
      { ok: false, message: "Не удалось определить товар." },
      { status: 422 },
    );
  }
  if (Object.keys(fields).length > 0) {
    return NextResponse.json(
      { ok: false, message: "Проверьте заполнение полей.", fields },
      { status: 422 },
    );
  }

  const ip = getClientIp(request);
  if (!consumeRateLimit(ip)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Слишком много заявок. Повторите немного позже.",
      },
      { status: 429 },
    );
  }

  if (!isSmtpConfigured()) {
    console.error("[ETIS one-click] SMTP_USER / SMTP_PASS не заданы");
    return NextResponse.json(
      {
        ok: false,
        message:
          "Почтовый сервис ещё не настроен. Позвоните нам по телефону.",
      },
      { status: 503 },
    );
  }

  const formattedPhone = formatPhone(phoneDigits);
  const createdAt = new Intl.DateTimeFormat("ru-KZ", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Asia/Almaty",
  }).format(new Date());

  const safe = {
    name: escapeHtml(name),
    phone: escapeHtml(formattedPhone),
    productTitle: escapeHtml(productTitle),
    productSku: escapeHtml(productSku || "не указан"),
    productId: escapeHtml(productId || "—"),
    page: escapeHtml(page || `/product/${productSlug}`),
    createdAt: escapeHtml(createdAt),
    ip: escapeHtml(ip),
  };

  const html = `
<!doctype html>
<html lang="ru">
  <body style="margin:0;padding:0;background:#eef4fb;font-family:Arial,Helvetica,sans-serif;color:#10223e">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background:#eef4fb">
      <tr><td align="center">
        <table role="presentation" width="660" cellspacing="0" cellpadding="0" style="width:100%;max-width:660px;overflow:hidden;border-radius:24px;background:#fff;box-shadow:0 22px 60px rgba(8,52,105,.14)">
          <tr><td style="padding:30px 34px;background:linear-gradient(135deg,#1682ed,#06448f);color:#fff">
            <div style="font-size:12px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#c5e8ff">ETIS.KZ · быстрый заказ</div>
            <h1 style="margin:10px 0 0;font-size:30px;line-height:1.15">Купить в один клик</h1>
          </td></tr>
          <tr><td style="padding:30px 34px">
            <div style="margin-bottom:22px;padding:20px;border:1px solid #dceafb;border-radius:16px;background:#f6faff">
              <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5a7da4">Товар</div>
              <div style="margin-top:8px;font-size:19px;font-weight:800;line-height:1.35;color:#10223e">${safe.productTitle}</div>
              <div style="margin-top:12px;color:#667d98;font-size:13px">Артикул: ${safe.productSku} · ID: ${safe.productId}</div>
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px">
              <tr><td style="width:34%;padding:13px 15px;border-radius:12px 0 0 12px;background:#f5f8fc;color:#718096;font-size:12px;font-weight:700">Имя</td><td style="padding:13px 15px;border-radius:0 12px 12px 0;background:#f5f8fc;font-size:15px;font-weight:700">${safe.name}</td></tr>
              <tr><td style="padding:13px 15px;border-radius:12px 0 0 12px;background:#edf6ff;color:#3971ad;font-size:12px;font-weight:700">Телефон</td><td style="padding:13px 15px;border-radius:0 12px 12px 0;background:#edf6ff;font-size:17px;font-weight:800"><a href="tel:+${phoneDigits}" style="color:#0757b5;text-decoration:none">${safe.phone}</a></td></tr>
              <tr><td style="padding:13px 15px;border-radius:12px 0 0 12px;background:#f5f8fc;color:#718096;font-size:12px;font-weight:700">Количество</td><td style="padding:13px 15px;border-radius:0 12px 12px 0;background:#f5f8fc;font-weight:700">${quantity} шт.</td></tr>
              <tr><td style="padding:13px 15px;border-radius:12px 0 0 12px;background:#f5f8fc;color:#718096;font-size:12px;font-weight:700">Цена</td><td style="padding:13px 15px;border-radius:0 12px 12px 0;background:#f5f8fc;font-weight:800">${escapeHtml(formatMoney(totalPrice ?? unitPrice))}</td></tr>
              <tr><td style="padding:13px 15px;border-radius:12px 0 0 12px;background:#f5f8fc;color:#718096;font-size:12px;font-weight:700">Страница</td><td style="padding:13px 15px;border-radius:0 12px 12px 0;background:#f5f8fc;font-size:12px;word-break:break-all"><a href="${safe.page}" style="color:#0757b5">${safe.page}</a></td></tr>
            </table>
            <div style="margin-top:22px;padding:14px 16px;border-radius:13px;background:#f8fbff;color:#728298;font-size:11px;line-height:1.6">Отправлено: ${safe.createdAt}<br>IP: ${safe.ip}</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const plainText = [
    "Новый быстрый заказ с ETIS.KZ",
    `Товар: ${productTitle}`,
    `Артикул: ${productSku || "не указан"}`,
    `ID товара: ${productId || "—"}`,
    `Количество: ${quantity}`,
    `Цена: ${formatMoney(totalPrice ?? unitPrice)}`,
    `Имя: ${name}`,
    `Телефон: ${formattedPhone}`,
    `Страница: ${page || `/product/${productSlug}`}`,
    `Отправлено: ${createdAt}`,
    `IP: ${ip}`,
  ].join("\n");

  try {
    await sendMail({
      subject: `Купить в один клик: ${productTitle} — ${formattedPhone}`,
      html,
      text: plainText,
    });

    return NextResponse.json({
      ok: true,
      message:
        "Менеджер получил товар и ваш номер. Скоро свяжемся с вами.",
    });
  } catch (error) {
    console.error("[ETIS one-click] SMTP send failed:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Не удалось отправить заявку. Позвоните нам по телефону.",
      },
      { status: 502 },
    );
  }
}
