import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DeliveryHero } from "@/components/delivery/DeliveryHero";
import { DeliveryMethods } from "@/components/delivery/DeliveryMethods";
import { DeliverySteps } from "@/components/delivery/DeliverySteps";
import { PaymentMethods } from "@/components/delivery/PaymentMethods";
import { DeliveryFaq } from "@/components/delivery/DeliveryFaq";
import { DeliveryNotes } from "@/components/delivery/DeliveryNotes";
import "@/components/delivery/delivery.css";

export const metadata: Metadata = {
  title: "Доставка и оплата — ETIS",
  description:
    "Условия доставки и оплаты в ETIS: самовывоз со склада в Алматы, доставка по городу и всему Казахстану, оплата наличными, картой и по безналичному расчёту с НДС.",
  alternates: { canonical: "/delivery" },
};

/**
 * /delivery — статическая страница условий.
 *
 * Контент пока зашит в компоненты: точных тарифов нет, поэтому вместо
 * сумм описан принцип расчёта. Когда появится прайс — раздел легко
 * переводится на данные из админки без переделки вёрстки.
 */
export default function DeliveryPage() {
  return (
    <div className="container-narrow py-6 md:py-10">
      <Breadcrumbs
        items={[{ label: "Главная", href: "/" }, { label: "Доставка и оплата" }]}
      />

      <DeliveryHero />
      <DeliveryMethods />
      <DeliverySteps />
      <PaymentMethods />
      <DeliveryNotes />
      <DeliveryFaq />
    </div>
  );
}
