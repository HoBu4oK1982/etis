"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Droplets,
  Factory,
  Gauge,
  Handshake,
  Headphones,
  PackageCheck,
  Ruler,
  Settings,
  ShieldCheck,
  Snowflake,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

const REVEAL = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const DIRECTIONS = [
  {
    icon: Factory,
    title: "Отопление и котельные",
    text: "Котлы, горелки, автоматика и комплектующие для частных, коммерческих и промышленных объектов.",
  },
  {
    icon: Droplets,
    title: "Водоснабжение",
    text: "Насосные станции, ёмкости, расширительные баки и оборудование для стабильной подачи воды.",
  },
  {
    icon: Snowflake,
    title: "Климат и холодоснабжение",
    text: "Чиллеры, вентиляционные установки и профессиональные решения для точного микроклимата.",
  },
  {
    icon: Ruler,
    title: "Проектирование и сервис",
    text: "Подбор, расчёт, проектирование, поставка и техническое сопровождение инженерных систем.",
  },
];

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: "Проверенное оборудование",
    text: "Работаем с официальными производителями и поставляем оборудование с гарантией.",
  },
  {
    icon: Gauge,
    title: "Инженерная точность",
    text: "Подбираем решения по параметрам объекта, а не по принципу универсального комплекта.",
  },
  {
    icon: PackageCheck,
    title: "Комплексная поставка",
    text: "Комплектуем проект от основного оборудования до автоматики, арматуры и расходных материалов.",
  },
  {
    icon: Headphones,
    title: "Поддержка после продажи",
    text: "Помогаем с документацией, вводом в эксплуатацию и дальнейшим обслуживанием оборудования.",
  },
];

const STEPS = [
  {
    icon: Users,
    title: "Изучаем задачу",
    text: "Уточняем параметры объекта, режим работы, требования по мощности, срокам и бюджету.",
  },
  {
    icon: Settings,
    title: "Подбираем решение",
    text: "Инженеры рассчитывают конфигурацию и готовят понятное коммерческое предложение.",
  },
  {
    icon: Truck,
    title: "Поставляем оборудование",
    text: "Комплектуем заказ, проверяем документы и организуем доставку по Алматы и Казахстану.",
  },
  {
    icon: Wrench,
    title: "Сопровождаем проект",
    text: "Консультируем на этапе монтажа и остаёмся на связи после запуска системы.",
  },
];

export function AboutPageContent() {
  return (
    <>
      <section className="etis-company-hero etis-company-hero--about">
        <div className="etis-company-hero__copy">
          <div className="etis-company-eyebrow">
            <span />
            О компании
          </div>

          <h1>Инженерные решения, которым доверяют</h1>
          <p>
            ТОО «Европейские Технологии и Сервис» поставляет оборудование,
            проектирует инженерные системы и сопровождает проекты по всему
            Казахстану. Объединяем техническую экспертизу, надёжные бренды и
            понятный сервис в одном месте.
          </p>

          <div className="etis-company-chips">
            <span><CheckCircle2 size={15} />10+ лет опыта</span>
            <span><Factory size={15} />1000+ проектов</span>
            <span><Handshake size={15} />Официальные партнёры</span>
            <span><Truck size={15} />Работаем по Казахстану</span>
          </div>
        </div>

        <div className="etis-company-hero__visual" aria-hidden="true">
          <div className="etis-company-visual__orbit etis-company-visual__orbit--one" />
          <div className="etis-company-visual__orbit etis-company-visual__orbit--two" />
          <div className="etis-company-visual__core">
            <Factory size={44} strokeWidth={1.4} />
          </div>
          <div className="etis-company-visual__metric etis-company-visual__metric--top">
            <b>1000+</b><span>проектов</span>
          </div>
          <div className="etis-company-visual__metric etis-company-visual__metric--bottom">
            <b>10+</b><span>лет опыта</span>
          </div>
        </div>
      </section>

      <section className="etis-company-section">
        <header className="etis-company-section__head">
          <span>Что мы делаем</span>
          <h2>Оборудование и экспертиза для инженерных систем</h2>
          <p>
            Решаем задачи от подбора отдельной позиции до комплексного оснащения
            объекта с проектной и технической поддержкой.
          </p>
        </header>

        <motion.div
          className="etis-company-grid etis-company-grid--4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-70px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {DIRECTIONS.map(({ icon: Icon, title, text }) => (
            <motion.article key={title} className="etis-company-card" variants={REVEAL}>
              <span className="etis-company-card__icon"><Icon size={23} strokeWidth={1.8} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="etis-company-story">
        <motion.div
          className="etis-company-story__copy"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="etis-company-eyebrow"><span />Наш подход</div>
          <h2>Не просто продаём оборудование — отвечаем за решение задачи</h2>
          <p>
            Инженерная система должна работать стабильно, соответствовать
            расчётным параметрам и быть удобной в эксплуатации. Поэтому мы
            начинаем с задачи клиента, проверяем совместимость оборудования и
            заранее учитываем монтаж, автоматику и дальнейшее обслуживание.
          </p>

          <ul>
            <li><CheckCircle2 size={17} />Подбор оборудования по техническим параметрам объекта</li>
            <li><CheckCircle2 size={17} />Понятные спецификации без лишних и несовместимых позиций</li>
            <li><CheckCircle2 size={17} />Официальная гарантия и комплект документов</li>
            <li><CheckCircle2 size={17} />Консультации инженеров до и после поставки</li>
          </ul>
        </motion.div>

        <motion.div
          className="etis-company-story__panel"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="etis-company-story__panel-head">
            <span><Factory size={20} /></span>
            <div><b>ETIS</b><small>Европейские Технологии и Сервис</small></div>
          </div>
          <div className="etis-company-story__numbers">
            <div><b>4</b><span>ключевых направления</span></div>
            <div><b>1000+</b><span>успешных проектов</span></div>
            <div><b>10+</b><span>лет инженерного опыта</span></div>
            <div><b>KZ</b><span>поставки по стране</span></div>
          </div>
        </motion.div>
      </section>

      <section className="etis-company-section">
        <header className="etis-company-section__head">
          <span>Почему ETIS</span>
          <h2>Надёжность на каждом этапе проекта</h2>
          <p>От первого запроса до технической поддержки после запуска.</p>
        </header>

        <motion.div
          className="etis-company-grid etis-company-grid--4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-70px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {ADVANTAGES.map(({ icon: Icon, title, text }) => (
            <motion.article key={title} className="etis-company-card etis-company-card--compact" variants={REVEAL}>
              <span className="etis-company-card__icon"><Icon size={22} strokeWidth={1.8} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="etis-company-section">
        <header className="etis-company-section__head">
          <span>Как мы работаем</span>
          <h2>Понятный путь от задачи до готовой поставки</h2>
        </header>

        <motion.ol
          className="etis-company-process"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-70px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
        >
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <motion.li key={title} variants={REVEAL}>
              <span className="etis-company-process__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="etis-company-process__icon"><Icon size={21} strokeWidth={1.8} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      <section className="etis-company-cta">
        <div>
          <span>Есть задача?</span>
          <h2>Подберём инженерное решение под ваш объект</h2>
          <p>Расскажите, что нужно реализовать — инженер уточнит параметры и подготовит предложение.</p>
        </div>
        <div className="etis-company-cta__actions">
          <Link href="/contacts" className="etis-company-cta__primary">Связаться с нами</Link>
          <Link href="/shop" className="etis-company-cta__secondary">Перейти в каталог</Link>
        </div>
      </section>
    </>
  );
}
