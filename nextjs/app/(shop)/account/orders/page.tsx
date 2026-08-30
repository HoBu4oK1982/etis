import type { Metadata } from "next";
import { AccountExperience } from "@/components/account/AccountExperience";

export const metadata: Metadata = { title: "Мои заказы | ETIS.KZ" };
export default function OrdersPage() { return <AccountExperience mode="orders" />; }
