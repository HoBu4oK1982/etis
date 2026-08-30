/**
 * Общий SMTP-транспорт для отправки уведомлений из Next.js route handlers.
 *
 * Используется nodemailer + Gmail SMTP (или любой другой провайдер).
 * Переменные окружения (в .env / .env.local):
 *
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=seokoreanparts@gmail.com
 *   SMTP_PASS=<пароль приложения Google>
 *   SMTP_FROM=seokoreanparts@gmail.com
 *   SMTP_TO=info@etis.kz
 *
 * Для Gmail обязателен «Пароль приложения» (не обычный пароль аккаунта).
 * Создаётся: Google → Аккаунт → Безопасность → Двухэтапная → Пароли приложений.
 */

import nodemailer from "nodemailer";

let _transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (!_transport) {
    _transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });
  }
  return _transport;
}

export type MailOptions = {
  subject: string;
  html: string;
  text?: string;
  /** Переопределить получателя (по умолчанию SMTP_TO) */
  to?: string;
};

/**
 * Отправляет email через SMTP.
 * @returns true если письмо ушло, иначе бросает ошибку
 */
export async function sendMail(options: MailOptions): Promise<true> {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    throw new Error(
      "SMTP_USER или SMTP_PASS не заданы. Добавьте их в .env.local.",
    );
  }

  const from =
    process.env.SMTP_FROM?.trim() ||
    `ETIS.KZ <${user}>`;

  const to =
    options.to ||
    process.env.SMTP_TO?.trim() ||
    user;

  const transport = getTransport();

  await transport.sendMail({
    from,
    to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return true;
}

/**
 * Проверяет настроен ли SMTP (есть ли user + pass).
 */
export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
}
