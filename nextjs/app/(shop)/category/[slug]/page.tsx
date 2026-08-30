import type { Metadata } from "next";
import { getCategory } from "@/lib/api/categories";
import { CategoryPageView } from "@/components/catalog/CategoryPageView";
import { hasActiveFilters, parseCatalogParams } from "@/lib/utils/catalog-params";
import "@/components/product/product-detail.css";
import "@/components/catalog/catalog.css";

// ISR: 5 минут (см. REVALIDATE.catalog)
export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalogParams = parseCatalogParams(await searchParams);
  const filtered = hasActiveFilters(catalogParams) || catalogParams.page > 1;

  try {
    const data = await getCategory(slug);
    const c = data.current;

    return {
      title: c.meta?.title || c.title,
      description: c.meta?.description || c.short_description || undefined,
      keywords: c.meta?.keywords || undefined,
      alternates: { canonical: `/category/${slug}` },
      // Отфильтрованные выдачи в индекс не пускаем
      robots: filtered ? { index: false, follow: true } : undefined,
    };
  } catch {
    return { title: "Категория" };
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  return <CategoryPageView slug={slug} path={[]} searchParams={sp} />;
}
