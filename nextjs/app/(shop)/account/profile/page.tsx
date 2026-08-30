import type { Metadata } from "next";
import { AccountExperience } from "@/components/account/AccountExperience";

export const metadata: Metadata = { title: "Профиль | ETIS.KZ" };
export default function ProfilePage() { return <AccountExperience mode="profile" />; }
