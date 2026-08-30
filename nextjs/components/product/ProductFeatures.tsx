import Link from "next/link";
import { ShieldCheck, Truck, CalendarClock, Headset, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    Icon: ShieldCheck,
    title: "Гарантия 12 месяцев",
    desc: "Официальная гарантия на оборудование и комплектующие.",
  },
  {
    Icon: Truck,
    title: "Доставка по Казахстану",
    desc: "В любой регион, работаем с ТК и курьерскими службами.",
  },
  {
    Icon: CalendarClock,
    title: "Подбор за 1 день",
    desc: "Инженеры подберут решение и подготовят КП.",
  },
];

/**
 * Блок преимуществ в правой колонке карточки товара.
 *
 * Раньше это были три отдельные плитки в grid-cols-3 внутри колонки
 * шириной 460px — на каждую приходилось ~140px, заголовки ломались по
 * слогам, а под текстом оставалась пустота. Теперь один блок со строками:
 * иконка слева, текст справа — читается в один проход и по высоте
 * совпадает с соседними вкладками.
 */
export function ProductFeatures() {
  return (
    <div className="etis-features">
      {FEATURES.map(({ Icon, title, desc }) => (
        <div key={title} className="etis-features__row">
          <span className="etis-features__icon">
            <Icon size={20} strokeWidth={1.9} />
          </span>
          <div className="etis-features__body">
            <div className="etis-features__title">{title}</div>
            <div className="etis-features__desc">{desc}</div>
          </div>
        </div>
      ))}

      <Link href="/contacts" className="etis-features__cta">
        <span className="etis-features__cta-icon">
          <Headset size={18} strokeWidth={2} />
        </span>
        <span className="etis-features__cta-text">
          <strong>Нужна консультация?</strong>
          Ответим и рассчитаем систему
        </span>
        <ArrowRight size={16} strokeWidth={2.4} />
      </Link>
    </div>
  );
}
