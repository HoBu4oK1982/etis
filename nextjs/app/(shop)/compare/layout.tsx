import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Сравнение оборудования | ETIS.KZ",
  description: "Сравнение характеристик инженерного оборудования ETIS.KZ.",
  robots: { index: false, follow: false },
};

export default function CompareLayout({ children }: { children: ReactNode }) {
  return children;
}
