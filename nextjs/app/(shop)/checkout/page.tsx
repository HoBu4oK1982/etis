import type { Metadata } from "next";
import { CheckoutExperience } from "@/components/checkout/CheckoutExperience";

export const metadata: Metadata = {
  title: "Оформление заказа | ETIS.KZ",
  description: "Оформление заявки на инженерное оборудование ETIS.KZ.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutExperience />;
}
