import Link from "next/link";
import { AlertCircle, Mail, Phone } from "lucide-react";

const NOTES = [
  "Проверяйте комплектность и внешний вид оборудования до подписания документов — после подписания претензии по механическим повреждениям не принимаются.",
  "Гарантия производителя действует при наличии заполненного гарантийного талона и соблюдении условий монтажа.",
  "Оборудование, изготовленное или заказанное под конкретный проект, возврату и обмену не подлежит.",
  "Сроки поставки позиций «под заказ» согласовываются отдельно и фиксируются в счёте.",
];

/**
 * Блок «Важно знать» + контакты. Пока раздел не наполнен точными
 * тарифами, основной сценарий — связаться с менеджером.
 */
export function DeliveryNotes() {
  return (
    <>
      <section className="etis-del-section">
        <header className="etis-del-section__head">
          <h2>Важно знать</h2>
          <p>Несколько условий, которые избавят от спорных ситуаций при получении.</p>
        </header>

        <ul className="etis-del-notes">
          {NOTES.map((note) => (
            <li key={note}>
              <AlertCircle size={17} strokeWidth={2.1} />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="etis-del-cta">
        <div className="etis-del-cta__copy">
          <h2>Нужен точный расчёт доставки?</h2>
          <p>
            Назовите список оборудования и адрес — менеджер посчитает стоимость,
            сроки и подберёт оптимальный способ отправки.
          </p>
        </div>

        <div className="etis-del-cta__actions">
          <a href="tel:+77776280575" className="etis-del-cta__phone">
            <Phone size={18} strokeWidth={2.2} />
            +7 (777) 628-05-75
          </a>

          <a href="mailto:info@etis.kz" className="etis-del-cta__mail">
            <Mail size={17} strokeWidth={2.2} />
            info@etis.kz
          </a>

          <Link href="/contacts" className="etis-del-cta__link">
            Все контакты
          </Link>
        </div>
      </section>
    </>
  );
}
