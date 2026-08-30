import type { Metadata } from "next";
import { getCategory } from "@/lib/api/categories";
import { CategoryPageView } from "@/components/catalog/CategoryPageView";
import { hasActiveFilters, parseCatalogParams } from "@/lib/utils/catalog-params";
import "@/components/product/product-detail.css";
import "@/components/catalog/catalog.css";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string; path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug, path } = await params;
  const catalogParams = parseCatalogParams(await searchParams);
  const filtered = hasActiveFilters(catalogParams) || catalogParams.page > 1;
  const pathString = (path ?? []).join("/");

  try {
    const data = await getCategory(slug, pathString || undefined);
    const c = data.current;

    return {
      title: c.meta?.title || c.title,
      description: c.meta?.description || c.short_description || undefined,
      keywords: c.meta?.keywords || undefined,
      alternates: { canonical: `/category/${slug}/${pathString}` },
      robots: filtered ? { index: false, follow: true } : undefined,
    };
  } catch {
    return { title: "Категория" };
  }
}

/**
 * /category/{slug}/{path*} — вложенные категории до 5 уровней.
 * Вся логика та же, что у корневой страницы: отличается только путь.
 */
export default async function NestedCategoryPage({ params, searchParams }: PageProps) {
  const { slug, path } = await params;
  const sp = await searchParams;

  return <CategoryPageView slug={slug} path={path ?? []} searchParams={sp} />;
}
