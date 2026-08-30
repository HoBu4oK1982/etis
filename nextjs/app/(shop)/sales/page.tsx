import type { Metadata } from "next";
import { RemarkPageView } from "@/components/catalog/RemarkPageView";
import { hasActiveFilters, parseCatalogParams } from "@/lib/utils/catalog-params";
import "@/components/catalog/catalog.css";
import "@/components/catalog/remark-page.css";

// ISR: 5 минут (см. REVALIDATE.catalog)
export const revalidate = 300;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const params = parseCatalogParams(sp);
  const filtered = hasActiveFilters(params) || params.page > 1;

  return {
    title: "Акции и скидки на инженерное оборудование",
    description:
      "Актуальные скидки на котлы, насосы, радиаторы и другое оборудование в ETIS. Спецпредложения действуют, пока есть остатки на складе.",
    alternates: { canonical: "/sales" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function SalesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <RemarkPageView remark="sale" searchParams={sp} />;
}
