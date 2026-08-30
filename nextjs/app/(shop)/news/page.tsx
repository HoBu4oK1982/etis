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
    title: "Новинки каталога — свежее оборудование",
    description:
      "Новинки инженерного оборудования, только что поступившие в ETIS. Свежие модели котлов, насосов и климатики от производителей.",
    alternates: { canonical: "/news" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function NewsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <RemarkPageView remark="new" searchParams={sp} />;
}
