"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    title: "Оформление заказа",
    text: "Собираете корзину на сайте или отправляете список позиций менеджеру — по телефону, почте или через форму обратного звонка.",
  },
  {
    title: "Подтверждение и расчёт",
    text: "Проверяем наличие на складе, подбираем аналоги при необходимости и считаем стоимость доставки до вашего адреса.",
  },
  {
    title: "Оплата",
    text: "Физлицам — наличными или картой, организациям — по счёту. После поступления оплаты заказ уходит в сборку.",
  },
  {
    title: "Отгрузка и получение",
    text: "Передаём заказ в доставку или готовим к самовывозу. При получении проверяете комплектность и забираете документы.",
  },
];

/**
 * Как проходит заказ — вертикальная временная шкала.
 * Линия рисуется через ::before у списка, точки — у каждого шага.
 */
export function DeliverySteps() {
  return (
    <section className="etis-del-section">
      <header className="etis-del-section__head">
        <h2>Как проходит заказ</h2>
        <p>Четыре шага от заявки до получения оборудования.</p>
      </header>

      <motion.ol
        className="etis-del-steps"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {STEPS.map((step, i) => (
          <motion.li
            key={step.title}
            className="etis-del-step"
            variants={{
              hidden: { opacity: 0, x: -18 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <span className="etis-del-step__num">{i + 1}</span>
            <div className="etis-del-step__body">
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}
