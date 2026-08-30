import type { Metadata } from "next";
import { AccountExperience } from "@/components/account/AccountExperience";

export const metadata: Metadata = { title: "Личный кабинет | ETIS.KZ" };
export default function AccountPage() { return <AccountExperience mode="dashboard" />; }
