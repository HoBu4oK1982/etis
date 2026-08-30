import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Избранное | ETIS.KZ",
  description: "Сохранённое инженерное оборудование ETIS.KZ.",
  robots: { index: false, follow: false },
};

export default function FavouriteLayout({ children }: { children: ReactNode }) {
  return children;
}
