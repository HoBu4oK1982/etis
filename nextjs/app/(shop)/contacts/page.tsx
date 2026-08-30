import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactsPageContent } from "@/components/company/ContactsPageContent";
import "@/components/company/company-pages.css";

export const metadata: Metadata = {
  title: "Контакты — ETIS",
  description:
    "Контакты ETIS в Алматы: телефоны отдела продаж, электронная почта, адрес офиса, график работы и реквизиты компании.",
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  return (
    <div className="container-narrow py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />
      <ContactsPageContent />
    </div>
  );
}
