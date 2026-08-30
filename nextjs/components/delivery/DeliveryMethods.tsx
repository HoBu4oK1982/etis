"use client";

import { motion } from "framer-motion";
import { Building2, Package, Truck, Warehouse, type LucideIcon } from "lucide-react";

type Method = {
  icon: LucideIcon;
  title: string;
  price: string;
  term: string;
  text: string;
  points: string[];
};

const METHODS: Method[] = [
  {
    icon: Package,
    title: "Самовывоз со склада",
    price: "Бесплатно",
    term: "В день обращения",
    text: "Забираете заказ самостоятельно со склада в Алматы. Перед выездом менеджер подтверждает наличие и готовность позиций.",
    points: [
      "Проверка комплектности при получении",
      "Документы выдаём на месте",
      "Помощь с погрузкой",
    ],
  },
  {
    icon: Truck,
    title: "Доставка по Алматы",
    price: "По тарифу",
    term: "1–2 рабочих дня",
    text: "Привозим оборудование по адресу в черте города. Стоимость зависит от габаритов и веса — считает менеджер при оформлении.",
    points: [
      "Согласуем удобный интервал",
      "Разгрузка — по договорённости",
      "Возможна доставка на объект",
    ],
  },
  {
    icon: Building2,
    title: "Доставка по Казахстану",
    price: "По тарифу ТК",
    term: "Зависит от региона",
    text: "Отправляем транспортными компаниями в любой город. До терминала перевозчика в Алматы довозим сами.",
    points: [
      "Работаем с проверенными перевозчиками",
      "Даём трек-номер отправления",
      "Упаковка под межгород",
    ],
  },
  {
    icon: Warehouse,
    title: "Крупногабарит и проекты",
    price: "Индивидуально",
    term: "По согласованию",
    text: "Котельное, насосное и вентиляционное оборудование для объектов — доставку и разгрузку планируем отдельно под проект.",
    points: [
      "Подбор транспорта под груз",
      "Погрузочная техника при необходимости",
      "График поставки по этапам монтажа",
    ],
  },
];

/**
 * Способы доставки — карточки с появлением по скроллу.
 * Конкретные тарифы намеренно не зашиты: до появления утверждённого
 * прайса указываем принцип расчёта, а не выдуманные суммы.
 */
export function DeliveryMethods() {
  return (
    <section className="etis-del-section">
      <header className="etis-del-section__head">
        <h2>Способы доставки</h2>
        <p>
          Выберите удобный вариант при оформлении заказа — менеджер согласует
          детали и назовёт итоговую стоимость до оплаты.
        </p>
      </header>

      <motion.div
        className="etis-del-grid etis-del-grid--4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {METHODS.map((method) => {
          const Icon = method.icon;

          return (
            <motion.article
              key={method.title}
              className="etis-del-card"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <span className="etis-del-card__icon">
                <Icon size={22} strokeWidth={1.9} />
              </span>

              <h3>{method.title}</h3>
              <p className="etis-del-card__text">{method.text}</p>

              <ul className="etis-del-card__points">
                {method.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="etis-del-card__foot">
                <span className="etis-del-card__price">{method.price}</span>
                <span className="etis-del-card__term">{method.term}</span>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      <p className="etis-del-note">
        Тарифы на доставку уточняются у менеджера: раздел наполняется, актуальные
        условия всегда подтверждаем до оплаты заказа.
      </p>
    </section>
  );
}
