import type { Metadata } from "next";
import { LoginView } from "@/components/auth/LoginView";

export const metadata: Metadata = {
  title: "Вход — ETIS",
  description: "Вход в личный кабинет ETIS. Управление заказами, история покупок и персональные условия.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginView />;
}
