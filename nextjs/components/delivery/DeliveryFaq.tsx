"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQ = [
  {
    q: "Сколько стоит доставка?",
    a: "Стоимость зависит от габаритов, веса заказа и адреса. Менеджер называет точную сумму при подтверждении заказа — до оплаты. Самовывоз со склада в Алматы бесплатный.",
  },
  {
    q: "Как быстро отгружаете заказ?",
    a: "Позиции, которые есть на складе, отгружаем в день оплаты или на следующий рабочий день. Если товар под заказ — сроки поставки менеджер сообщает отдельно.",
  },
  {
    q: "Доставляете в другие города Казахстана?",
    a: "Да, отправляем транспортными компаниями по всей стране. До терминала перевозчика в Алматы груз довозим сами, дальше — по тарифам ТК с трек-номером.",
  },
  {
    q: "Можно ли оплатить по безналу с НДС?",
    a: "Да. Для организаций и ИП выставляем счёт, работаем с НДС и предоставляем полный пакет закрывающих документов.",
  },
  {
    q: "Можно ли проверить оборудование при получении?",
    a: "Обязательно проверьте комплектность и внешний вид до подписания документов. При самовывозе — на складе, при доставке — в присутствии водителя или представителя ТК.",
  },
  {
    q: "Что делать, если товар пришёл с повреждением?",
    a: "Зафиксируйте повреждение в документах перевозчика, сделайте фото и свяжитесь с нами. Разберём ситуацию и заменим оборудование.",
  },
];

export function DeliveryFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="etis-del-section">
      <header className="etis-del-section__head">
        <h2>Частые вопросы</h2>
        <p>Если ответа на ваш вопрос нет — напишите или позвоните, подскажем.</p>
      </header>

      <div className="etis-del-faq">
        {FAQ.map((item, i) => {
          const open = openIndex === i;

          return (
            <div key={item.q} className={`etis-del-faq__item${open ? " is-open" : ""}`}>
              <button
                type="button"
                className="etis-del-faq__btn"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : i)}
              >
                {item.q}
                <ChevronDown size={18} strokeWidth={2.4} />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <p className="etis-del-faq__answer">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
