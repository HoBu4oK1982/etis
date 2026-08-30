import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { getTopCategories } from "@/lib/api/shop";

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20.66 3.53 2.82 10.41c-1.22.49-1.21 1.17-.22 1.47l4.58 1.43 1.76 5.38c.21.59.11.82.72.82.47 0 .68-.21.94-.46l2.2-2.14 4.58 3.38c.84.46 1.45.22 1.66-.78l3-14.13c.31-1.23-.47-1.79-1.38-1.45ZM8.14 12.98l8.94-5.64c.45-.27.86-.12.52.18l-7.38 6.66-.28 3.04-1.8-4.24Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12.04 2a9.83 9.83 0 0 0-8.46 14.84L2 22l5.29-1.53A9.9 9.9 0 1 0 12.04 2Zm0 17.92a8.04 8.04 0 0 1-4.1-1.12l-.29-.17-3.14.91.92-3.06-.19-.31a8 8 0 1 1 6.8 3.75Zm4.4-6.02c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19a7.22 7.22 0 0 1-1.33-1.65c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.43-.59 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.7" r="1.15" fill="currentColor" />
    </svg>
  );
}

/**
 * Ссылки «Компания» — только реально существующие страницы.
 * «Проекты/Сертификаты/Вакансии» убраны до тех пор, пока разделы
 * не появятся; ссылка на пустую страницу хуже её отсутствия.
 */
const companyLinks: string[][] = [
  ["О нас", "/about"],
  ["Блог", "/articles"],
  ["Доставка и оплата", "/delivery"],
  ["Контакты", "/contacts"],
];

const buyerLinks: string[][] = [
  ["Хиты продаж", "/hits"],
  ["Новинки", "/news"],
  ["Акции", "/sales"],
  ["Бренды", "/brands"],
  ["Избранное", "/favourite"],
  ["Сравнение", "/compare"],
  ["Корзина", "/cart"],
];

/**
 * Футер — server component.
 * Каталог берётся из API (top-level категории): ссылки всегда актуальны,
 * менеджеры добавляют раздел в админке — он тут же появится и здесь
 * при следующей ревалидации ISR (5 минут). Никаких хардкодов путей типа
 * /catalog/heating, которых на самом деле в маршрутах нет.
 */
export async function Footer() {
  const catalog = await getTopCategories().catch(() => []);
  const catalogLinks = catalog.slice(0, 6).map((cat) => [cat.title, `/category/${cat.slug}`] as const);

  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container-narrow">
        <section className="footer-subscribe" aria-labelledby="footer-subscribe-title">
          <div className="footer-subscribe-copy">
            <h2 id="footer-subscribe-title">Будьте в курсе новинок и акций</h2>
            <p>Подпишитесь на нашу рассылку</p>
          </div>

          <form className="footer-subscribe-form">
            <label className="sr-only" htmlFor="footer-email">Ваш e-mail</label>
            <input id="footer-email" type="email" placeholder="Введите ваш e-mail" />
            <button type="submit">Подписаться</button>
          </form>

          <div className="footer-subscribe-image" aria-hidden="true" />
        </section>

        <div className="footer-main-grid">
          <div className="footer-brand-column">
            <Link href="/" aria-label="ETC — главная" className="footer-logo-link">
              <Logo size={100} />
            </Link>
            <p>
              ETC — ваш надёжный партнёр <br />
              в сфере инженерных систем. <br />
              Поставляем оборудование, <br />
              выполняем проекты и обеспечиваем <br />
              безупречный сервис.
            </p>
            <div className="footer-socials" aria-label="Социальные сети">
              <a href="#" aria-label="Telegram" className="telegram" rel="noopener"><TelegramIcon /></a>
              <a href="#" aria-label="WhatsApp" className="whatsapp" rel="noopener"><WhatsAppIcon /></a>
              <a href="#" aria-label="Instagram" className="instagram" rel="noopener"><InstagramIcon /></a>
            </div>
          </div>

          {catalogLinks.length > 0 ? (
            <FooterLinks title="Каталог" links={catalogLinks as unknown as string[][]} />
          ) : (
            /* Fallback, если API упал — хотя бы одна ссылка на каталог */
            <FooterLinks title="Каталог" links={[["Все категории", "/shop"]]} />
          )}
          <FooterLinks title="Компания" links={companyLinks} />
          <FooterLinks title="Покупателям" links={buyerLinks} />

          <div className="footer-links-column footer-contacts-column">
            <h3>Контакты</h3>
            <a href="tel:+77083280575"><Phone size={20} />+7 708 328 05 75</a>
            <a href="tel:+77273280575"><Phone size={20} />+7 (727) 328 05 75</a>
            <a href="mailto:info@etis.kz"><Mail size={20} />info@etis.kz</a>
            <div><MapPin size={20} />г. Алматы, <br />ул. Жарокова 126, оф. 48</div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} ТОО «Европейские Технологии и Сервис». Все права защищены.</span>
          <div className="footer-legal-links">
            <Link href="/privacy">Политика конфиденциальности</Link>
            <span aria-hidden="true" />
            <Link href="/terms">Пользовательское соглашение</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[][] }) {
  return (
    <nav className="footer-links-column" aria-label={title}>
      <h3>{title}</h3>
      {links.map(([label, href]) => (
        <Link key={label} href={href}>{label}</Link>
      ))}
    </nav>
  );
}
