import type { Metadata } from "next";
import { RegisterView } from "@/components/auth/RegisterView";

export const metadata: Metadata = {
  title: "Регистрация — ETIS",
  description: "Создание аккаунта ETIS. Быстрый заказ инженерного оборудования, история покупок и персональные условия.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterView />;
}
