import { MapPin, Truck } from "lucide-react";

/**
 * Шапка страницы «Доставка и оплата».
 * Серверный компонент — контент статический, гидрация не нужна.
 *
 * Справа — тематическая иллюстрация (глобус + коробки + фитинги
 * на чертежах), клипается по диагонали как в подписке футера,
 * чтобы визуально связать разделы. Ассет живёт в /public/images/delivery/.
 */
export function DeliveryHero() {
  return (
    <section className="etis-del-hero">
      <div className="etis-del-hero__copy">
        <h1>Доставка и оплата</h1>

        <p>
          Отгружаем оборудование со склада в Алматы и доставляем по всему
          Казахстану. Точные сроки и стоимость доставки менеджер рассчитывает
          при подтверждении заказа — они зависят от габаритов, веса и адреса
          доставки.
        </p>

        <div className="etis-del-hero__chips">
          <span className="etis-del-chip">
            <Truck size={15} strokeWidth={2.2} />
            Доставка по Казахстану
          </span>
          <span className="etis-del-chip">
            <MapPin size={15} strokeWidth={2.2} />
            Самовывоз в Алматы
          </span>
        </div>
      </div>

      <div className="etis-del-hero__media" aria-hidden="true" />
    </section>
  );
}
