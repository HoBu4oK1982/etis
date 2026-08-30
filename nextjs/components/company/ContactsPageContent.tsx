"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CalendarClock,
  Clock3,
  FileText,
  Headphones,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  PhoneCall,
  ShieldCheck,
  Truck,
} from "lucide-react";

const REVEAL = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const CONTACTS = [
  {
    icon: PhoneCall,
    eyebrow: "Отдел продаж",
    value: "+7 708 328 05 75",
    href: "tel:+77083280575",
    note: "Подбор оборудования и коммерческие предложения",
  },
  {
    icon: Phone,
    eyebrow: "Городской номер",
    value: "+7 (727) 328 05 75",
    href: "tel:+77273280575",
    note: "Общие вопросы, документы и соединение со специалистом",
  },
  {
    icon: MessageCircle,
    eyebrow: "WhatsApp",
    value: "+7 (777) 628-05-75",
    href: "https://wa.me/77776280575",
    note: "Отправьте список оборудования, фото или техническое задание",
    external: true,
  },
  {
    icon: Mail,
    eyebrow: "Электронная почта",
    value: "info@etis.kz",
    href: "mailto:info@etis.kz",
    note: "Запросы, спецификации, счета и проектная документация",
  },
];

const REQUISITES = [
  ["Наименование", "ТОО «Европейские Технологии и Сервис»"],
  ["ИИН / БИН", "470107401230"],
  ["РНН", "600411149065"],
  ["Банк", "АО «Народный Банк Казахстана», г. Алматы"],
  ["БИК", "HSBKKZKX"],
  ["Р/с (KZT)", "KZ586017131000067131"],
  ["Руководитель", "Шестакова Вера Капитоновна"],
];

export function ContactsPageContent() {
  return (
    <>
      <section className="etis-company-hero etis-company-hero--contacts">
        <div className="etis-company-hero__copy">
          <div className="etis-company-eyebrow"><span />Контакты ETIS</div>
          <h1>Всегда на связи по вашему проекту</h1>
          <p>
            Подберём оборудование, уточним наличие, подготовим коммерческое
            предложение и организуем доставку. Выберите удобный способ связи —
            специалисты ETIS ответят в рабочее время.
          </p>

          <div className="etis-company-chips">
            <span><MapPin size={15} />Алматы, Казахстан</span>
            <span><Clock3 size={15} />Пн–Пт, 09:00–18:00</span>
            <span><Truck size={15} />Поставка по Казахстану</span>
            <span><Headphones size={15} />Техническая консультация</span>
          </div>
        </div>

        <div className="etis-contacts-hero__visual" aria-hidden="true">
          <div className="etis-contacts-hero__grid" />
          <div className="etis-contacts-hero__pin"><MapPin size={34} strokeWidth={1.7} /></div>
          <div className="etis-contacts-hero__route etis-contacts-hero__route--one" />
          <div className="etis-contacts-hero__route etis-contacts-hero__route--two" />
          <div className="etis-contacts-hero__label"><b>ETIS</b><span>Алматы</span></div>
        </div>
      </section>

      <section className="etis-company-section">
        <header className="etis-company-section__head">
          <span>Связаться с нами</span>
          <h2>Выберите удобный канал</h2>
          <p>По вопросам оборудования, поставки, документов и технического сопровождения.</p>
        </header>

        <motion.div
          className="etis-contacts-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-70px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {CONTACTS.map(({ icon: Icon, eyebrow, value, href, note, external }) => (
            <motion.a
              key={eyebrow}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              className="etis-contact-card"
              variants={REVEAL}
            >
              <span className="etis-contact-card__icon"><Icon size={22} strokeWidth={1.9} /></span>
              <span className="etis-contact-card__eyebrow">{eyebrow}</span>
              <strong>{value}</strong>
              <small>{note}</small>
              <span className="etis-contact-card__arrow">→</span>
            </motion.a>
          ))}
        </motion.div>
      </section>

      <section className="etis-contacts-location">
        <motion.div
          className="etis-contacts-location__copy"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="etis-company-eyebrow"><span />Офис в Алматы</div>
          <h2>г. Алматы, ул. Жарокова 126, офис 48</h2>
          <p>
            Перед визитом рекомендуем связаться с менеджером: он подтвердит
            наличие оборудования, подготовит документы и согласует удобное время.
          </p>

          <div className="etis-contacts-location__facts">
            <div><CalendarClock size={19} /><span><b>Понедельник — пятница</b><small>09:00–18:00</small></span></div>
            <div><ShieldCheck size={19} /><span><b>Выдача после подтверждения</b><small>Заказ будет подготовлен заранее</small></span></div>
            <div><Building2 size={19} /><span><b>Юридические и физические лица</b><small>Счёт, договор и полный пакет документов</small></span></div>
          </div>

          <a
            className="etis-contacts-location__button"
            href="https://2gis.kz/almaty/search/%D0%96%D0%B0%D1%80%D0%BE%D0%BA%D0%BE%D0%B2%D0%B0%20126"
            target="_blank"
            rel="noreferrer"
          >
            <Navigation size={17} strokeWidth={2.1} />
            Построить маршрут
          </a>
        </motion.div>

        <motion.div
          className="etis-contacts-map"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Схема расположения офиса ETIS"
        >
          <div className="etis-contacts-map__roads" />
          <span className="etis-contacts-map__road etis-contacts-map__road--a" />
          <span className="etis-contacts-map__road etis-contacts-map__road--b" />
          <span className="etis-contacts-map__road etis-contacts-map__road--c" />
          <div className="etis-contacts-map__marker"><MapPin size={26} /><span>ETIS</span></div>
          <span className="etis-contacts-map__caption">Жарокова, 126</span>
        </motion.div>
      </section>

      <section className="etis-company-section">
        <header className="etis-company-section__head">
          <span>Для документов</span>
          <h2>Реквизиты компании</h2>
          <p>Основные данные для договора, счёта и закрывающих документов.</p>
        </header>

        <div className="etis-contacts-requisites">
          <div className="etis-contacts-requisites__intro">
            <span><FileText size={25} strokeWidth={1.8} /></span>
            <h3>ТОО «Европейские Технологии и Сервис»</h3>
            <p>Поставка инженерного оборудования, проектирование и техническое сопровождение.</p>
            <div><Landmark size={17} />АО «Народный Банк Казахстана»</div>
          </div>

          <dl>
            {REQUISITES.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div>
              <dt>Юридический адрес</dt>
              <dd>Республика Казахстан, г. Алматы, ул. Жарокова, д. 126, оф. 48</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="etis-company-cta etis-company-cta--contacts">
        <div>
          <span>Нужна консультация?</span>
          <h2>Отправьте список оборудования менеджеру</h2>
          <p>Проверим наличие, подберём аналоги и подготовим предложение с условиями поставки.</p>
        </div>
        <div className="etis-company-cta__actions">
          <a href="tel:+77083280575" className="etis-company-cta__primary"><Phone size={17} />Позвонить</a>
          <a href="mailto:info@etis.kz" className="etis-company-cta__secondary"><Mail size={17} />Написать на почту</a>
        </div>
      </section>
    </>
  );
}
