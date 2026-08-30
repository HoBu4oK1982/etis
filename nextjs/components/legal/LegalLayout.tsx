import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Calendar, FileText, MapPin, Phone, Mail } from "lucide-react";

type Props = {
  title: string;
  eyebrow: string;
  updatedAt: string;
  intro: string;
  children: React.ReactNode;
};

/**
 * Общая обёртка юридических документов (Политика, Соглашение).
 *
 * Hero в едином стиле /brands и /delivery — инженерная сетка + eyebrow,
 * плюс справа плашка с датой обновления и «типом документа». Основной
 * контент отдаётся children — оба документа отличаются только текстом,
 * структурой h2/p/ul; вёрстка и типографика общие.
 */
export function LegalLayout({ title, eyebrow, updatedAt, intro, children }: Props) {
  return (
    <div className="container-narrow py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: title }]} />

      <section className="etis-legal-hero">
        <div className="etis-legal-hero__copy">
          <div className="etis-legal-hero__eyebrow">
            <span />
            {eyebrow}
          </div>

          <h1>{title}</h1>
          <p>{intro}</p>
        </div>

        <aside className="etis-legal-hero__meta">
          <div className="etis-legal-hero__meta-row">
            <FileText size={16} strokeWidth={2.1} />
            <span>Документ</span>
          </div>
          <div className="etis-legal-hero__meta-row">
            <Calendar size={16} strokeWidth={2.1} />
            <span>Обновлено {updatedAt}</span>
          </div>
        </aside>
      </section>

      <article className="etis-legal">{children}</article>

      <section className="etis-legal-contacts">
        <div>
          <h3>Остались вопросы?</h3>
          <p>
            Свяжитесь с нами — ответим и уточним всё, что касается обработки
            данных или условий использования.
          </p>
        </div>
        <div className="etis-legal-contacts__actions">
          <a href="tel:+77083280575" className="etis-legal-contacts__cta">
            <Phone size={16} strokeWidth={2.2} />
            +7 708 328 05 75
          </a>
          <a href="mailto:info@etis.kz" className="etis-legal-contacts__mail">
            <Mail size={15} strokeWidth={2.2} />
            info@etis.kz
          </a>
          <Link href="/contacts" className="etis-legal-contacts__link">
            Все контакты
          </Link>
        </div>
      </section>

      {/* Реквизиты компании — общая подпись в конце обоих документов */}
      <section className="etis-legal-org">
        <h3>Реквизиты</h3>
        <dl>
          <div>
            <dt>Наименование</dt>
            <dd>ТОО «Европейские Технологии и Сервис»</dd>
          </div>
          <div>
            <dt>Адрес</dt>
            <dd>
              <MapPin size={13} strokeWidth={2.4} />
              Республика Казахстан, г. Алматы, ул. Жарокова, д. 126, оф. 48
            </dd>
          </div>
          <div>
            <dt>РНН</dt>
            <dd>600411149065</dd>
          </div>
          <div>
            <dt>ИИН / БИН</dt>
            <dd>470107401230</dd>
          </div>
          <div>
            <dt>Банк</dt>
            <dd>АО «Народный Банк Казахстана», г. Алматы</dd>
          </div>
          <div>
            <dt>БИК</dt>
            <dd>HSBKKZKX</dd>
          </div>
          <div>
            <dt>Р/с (KZT)</dt>
            <dd>KZ586017131000067131</dd>
          </div>
          <div>
            <dt>Руководитель</dt>
            <dd>Шестакова Вера Капитоновна</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
