import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "lenis/dist/lenis.css";
import "./scrollbars.css";
import { Providers } from "./providers";
import CursorFollower from "@/components/ui/CursorFollower";
import Preloader from "@/components/ui/Preloader";
import CookieConsent from "@/components/cookies/CookieConsent";
import { ToastContainer } from "@/components/ui/Toast";
import YandexMetrika from "@/components/analytics/YandexMetrika";
import { CallbackWidget } from "@/components/callback/CallbackWidget";
import { CopyProtection } from '@/components/ui/CopyProtection';
import { ImageWatermark } from '@/components/ui/ImageWatermark';
import { OrganizationSchema } from "@/components/seo/SchemaOrg";

export const metadata: Metadata = {
  title: {
    default: "etis.kz — отопительное и климатическое оборудование",
    template: "%s · etis.kz",
  },
  description:
    "Интернет-магазин отопительного и климатического оборудования: котлы, конвекторы, радиаторы, тепловые насосы и всё для комфортного микроклимата.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://etis.kz"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: "/favicon.ico",
  },
};

/**
 * Устанавливает сохранённую тему до гидратации, чтобы не было вспышки
 * светлой темы у пользователя, выбравшего тёмную.
 */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('etis-theme');
    var dark = stored === 'dark'
      || (stored !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) { /* private mode / disabled storage — ok */ }
})();
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
      <OrganizationSchema />
      <CopyProtection />
      <ImageWatermark />
        <Preloader />

        <Providers>
          {children}
          {/* Плавающие кнопки: наверх, телефон, WhatsApp и callback-форма. */}
          <CallbackWidget />
        </Providers>

        <CookieConsent />
        <ToastContainer />

        <Suspense fallback={null}>
          <YandexMetrika />
        </Suspense>

        <CursorFollower />
      </body>
    </html>
  );
}
