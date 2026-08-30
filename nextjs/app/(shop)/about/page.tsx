import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AboutPageContent } from "@/components/company/AboutPageContent";
import "@/components/company/company-pages.css";

export const metadata: Metadata = {
  title: "О компании — ETIS",
  description:
    "ETIS — поставщик инженерного оборудования и комплексных решений для отопления, водоснабжения, вентиляции и холодоснабжения в Алматы и по Казахстану.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container-narrow py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "О нас" }]} />
      <AboutPageContent />
    </div>
  );
}
