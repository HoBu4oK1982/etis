import { NextRequest, NextResponse } from "next/server";
import { isSmtpConfigured, sendMail } from "@/lib/mail/smtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CallbackPayload = {
  name?: unknown;
  phone?: unknown;
  website?: unknown;
  source?: unknown;
  page?: unknown;
  startedAt?: unknown;
};

type RateEntry = {
  count: number;
  resetAt: number;
};

type CallbackGlobals = typeof globalThis & {
  __etisCallbackRateLimit?: Map<string, RateEntry>;
};

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 4;

const globalStore = globalThis as CallbackGlobals;
const rateLimit =
  globalStore.__etisCallbackRateLimit ?? new Map<string, RateEntry>();
globalStore.__etisCallbackRateLimit = rateLimit;

function text(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
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

  if (rateLimit.size > 1000) {
    for (const [ip, entry] of rateLimit) {
      if (entry.resetAt <= now) rateLimit.delete(ip);
    }
  }

  return true;
}

function originIsAllowed(request: NextRequest) {
  const configured = (process.env.CALLBACK_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (configured.length === 0) return true;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  return configured.includes(origin);
}

function buildMailHtml({
  name,
  phone,
  source,
  page,
  ip,
  createdAt,
}: {
  name: string;
  phone: string;
  source: string;
  page: string;
  ip: string;
  createdAt: string;
}) {
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeSource = escapeHtml(source || "site");
  const safePage = escapeHtml(page || "/");
  const safeIp = escapeHtml(ip);
  const safeCreatedAt = escapeHtml(createdAt);

  return `
<!doctype html>
<html lang="ru">
  <body style="margin:0;padding:0;background:#f3f7fc;font-family:Arial,Helvetica,sans-serif;color:#10223e">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7fc;padding:28px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;overflow:hidden;border-radius:24px;background:#ffffff;box-shadow:0 18px 55px rgba(12,57,112,.12)">
            <tr>
              <td style="padding:30px 34px;background:linear-gradient(135deg,#0d6fdc,#063c82);color:#ffffff">
                <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#b9e3ff">ETIS.KZ · новый запрос</div>
                <h1 style="margin:10px 0 0;font-size:30px;line-height:1.15">Обратный звонок</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 34px">
                <p style="margin:0 0 22px;color:#66758a;font-size:14px;line-height:1.6">Посетитель сайта просит связаться с ним. Контактные данные:</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px">
                  <tr>
                    <td style="width:34%;padding:13px 15px;border-radius:12px 0 0 12px;background:#f5f8fc;color:#718096;font-size:12px;font-weight:700">Имя</td>
                    <td style="padding:13px 15px;border-radius:0 12px 12px 0;background:#f5f8fc;color:#10223e;font-size:15px;font-weight:700">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:13px 15px;border-radius:12px 0 0 12px;background:#edf6ff;color:#3971ad;font-size:12px;font-weight:700">Телефон</td>
                    <td style="padding:13px 15px;border-radius:0 12px 12px 0;background:#edf6ff;color:#0757b5;font-size:17px;font-weight:800"><a href="tel:+${escapeHtml(normalizePhone(phone))}" style="color:#0757b5;text-decoration:none">${safePhone}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:13px 15px;border-radius:12px 0 0 12px;background:#f5f8fc;color:#718096;font-size:12px;font-weight:700">Страница</td>
                    <td style="padding:13px 15px;border-radius:0 12px 12px 0;background:#f5f8fc;color:#10223e;font-size:13px">${safePage}</td>
                  </tr>
                  <tr>
                    <td style="padding:13px 15px;border-radius:12px 0 0 12px;background:#f5f8fc;color:#718096;font-size:12px;font-weight:700">Источник кнопки</td>
                    <td style="padding:13px 15px;border-radius:0 12px 12px 0;background:#f5f8fc;color:#10223e;font-size:13px">${safeSource}</td>
                  </tr>
                </table>

                <div style="margin-top:22px;padding:15px 16px;border:1px solid #dce9f7;border-radius:14px;background:#f8fbff;color:#62748b;font-size:11px;line-height:1.6">
                  Отправлено: ${safeCreatedAt}<br>
                  IP: ${safeIp}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function POST(request: NextRequest) {
  if (!originIsAllowed(request)) {
    return NextResponse.json(
      { ok: false, message: "Запрос с этого домена запрещён." },
      { status: 403 },
    );
  }

  let payload: CallbackPayload;
  try {
    payload = (await request.json()) as CallbackPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Некорректный формат запроса." },
      { status: 400 },
    );
  }

  // Honeypot
  if (text(payload.website, 160)) {
    return NextResponse.json({
      ok: true,
      message: "Спасибо! Мы получили вашу заявку.",
    });
  }

  // Timing
  const startedAt = Number(payload.startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < 700) {
    return NextResponse.json({
      ok: true,
      message: "Спасибо! Мы получили вашу заявку.",
    });
  }

  const name = text(payload.name, 80);
  const phoneDigits = normalizePhone(text(payload.phone, 40));
  const source = text(payload.source, 80) || "site";
  const page = text(payload.page, 220) || "/";

  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "Укажите имя — минимум 2 символа.";
  if (phoneDigits.length !== 11 || !phoneDigits.startsWith("7")) {
    fields.phone = "Введите корректный телефон в формате +7.";
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
        message:
          "Слишком много заявок за короткое время. Позвоните нам или повторите позже.",
      },
      { status: 429 },
    );
  }

  if (!isSmtpConfigured()) {
    console.error(
      "[ETIS callback] SMTP_USER / SMTP_PASS не заданы. Настройте .env.local.",
    );
    return NextResponse.json(
      {
        ok: false,
        message:
          "Почтовый сервис ещё не настроен. Позвоните нам по номеру +7 (727) 328 05 75.",
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

  const html = buildMailHtml({
    name,
    phone: formattedPhone,
    source,
    page,
    ip,
    createdAt,
  });

  const plainText = [
    "Новая заявка на обратный звонок с ETIS.KZ",
    `Имя: ${name}`,
    `Телефон: ${formattedPhone}`,
    `Страница: ${page}`,
    `Источник: ${source}`,
    `Отправлено: ${createdAt}`,
    `IP: ${ip}`,
  ].join("\n");

  try {
    await sendMail({
      subject: `Перезвонить: ${name} — ${formattedPhone}`,
      html,
      text: plainText,
    });

    return NextResponse.json({
      ok: true,
      message:
        "Контакты уже у менеджера. Мы перезвоним вам в рабочее время.",
    });
  } catch (error) {
    console.error("[ETIS callback] SMTP send failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "Не удалось отправить заявку. Позвоните нам по номеру +7 (727) 328 05 75.",
      },
      { status: 502 },
    );
  }
}
