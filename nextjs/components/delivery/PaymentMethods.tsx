"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  Building,
  CreditCard,
  FileText,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

type Payment = {
  icon: LucideIcon;
  title: string;
  text: string;
  tag?: string;
};

const PAYMENTS: Payment[] = [
  {
    icon: Banknote,
    title: "Наличными",
    text: "При самовывозе со склада или курьеру при получении заказа. Выдаём фискальный чек.",
    tag: "Физлицам",
  },
  {
    icon: CreditCard,
    title: "Банковской картой",
    text: "Visa, Mastercard — на складе через терминал. Оплата онлайн на сайте появится в ближайшее время.",
    tag: "Физлицам",
  },
  {
    icon: Smartphone,
    title: "Перевод по номеру",
    text: "Kaspi и другие мобильные приложения — по реквизитам, которые пришлёт менеджер.",
    tag: "Физлицам",
  },
  {
    icon: Building,
    title: "Безналичный расчёт",
    text: "Оплата по счёту с расчётного счёта организации. Работаем с НДС, закрывающие документы предоставляем.",
    tag: "Юрлицам и ИП",
  },
  {
    icon: FileText,
    title: "Оплата по договору",
    text: "Для проектных поставок — договор с графиком платежей: предоплата и расчёт по этапам отгрузки.",
    tag: "Юрлицам и ИП",
  },
];

export function PaymentMethods() {
  return (
    <section className="etis-del-section">
      <header className="etis-del-section__head">
        <h2>Способы оплаты</h2>
        <p>
          Работаем с физическими и юридическими лицами. Для организаций
          выставляем счёт и предоставляем полный пакет документов.
        </p>
      </header>

      <motion.div
        className="etis-del-grid etis-del-grid--3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {PAYMENTS.map((payment) => {
          const Icon = payment.icon;

          return (
            <motion.article
              key={payment.title}
              className="etis-del-pay"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <span className="etis-del-pay__icon">
                <Icon size={20} strokeWidth={1.9} />
              </span>

              <div>
                <div className="etis-del-pay__head">
                  <h3>{payment.title}</h3>
                  {payment.tag && <span>{payment.tag}</span>}
                </div>
                <p>{payment.text}</p>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
