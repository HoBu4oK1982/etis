import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccess } from "@/components/checkout/OrderSuccess";

export const metadata: Metadata = {
  title: "Заказ принят | ETIS.KZ",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <Suspense fallback={null}><OrderSuccess /></Suspense>;
}
