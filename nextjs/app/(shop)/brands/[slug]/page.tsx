import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { normalizeRichTextHtml } from "@/lib/utils/image";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CatalogProvider } from "@/components/catalog/CatalogProvider";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { ActiveFilters } from "@/components/catalog/ActiveFilters";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { MobileFiltersDrawer } from "@/components/catalog/MobileFiltersDrawer";
import { BrandHero } from "@/components/brands/BrandHero";
import { BrandFiltersPanel } from "@/components/brands/BrandFiltersPanel";
import { getBrandDetail, getBrandProducts } from "@/lib/api/brands";
import { EMPTY_BRAND_PRODUCTS } from "@/lib/types/brand";
import { hasActiveFilters, parseCatalogParams } from "@/lib/utils/catalog-params";
import "@/components/product/product-detail.css";
import "@/components/catalog/catalog.css";
import "@/components/brands/brands.css";

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
    const brand = await getBrandDetail(slug);

    return {
      title: `${brand.title} — купить оборудование в Казахстане`,
      description: brand.description
        ? stripTags(brand.description).slice(0, 300)
        : `Оборудование ${brand.title}: ${brand.products_count} позиций в каталоге ETIS. Официальная гарантия, доставка по Казахстану.`,
      alternates: { canonical: `/brands/${slug}` },
      // Отфильтрованные выдачи в индекс не пускаем
      robots: filtered ? { index: false, follow: true } : undefined,
    };
  } catch {
    return { title: "Бренд" };
  }
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const catalogParams = parseCatalogParams(await searchParams);

  let response;
  try {
    response = await getBrandProducts(slug, catalogParams);
  } catch {
    notFound();
  }

  const brand = response.brand;
  if (!brand) notFound();

  const products = response.data ?? [];
  const meta = response.meta ?? EMPTY_BRAND_PRODUCTS.meta;
  const facets = response.filters ?? EMPTY_BRAND_PRODUCTS.filters!;

  const filtersPanel = (
    <BrandFiltersPanel
      brand={brand}
      categories={facets.categories}
      price={facets.price}
      remarks={facets.remarks}
    />
  );

  const normalizedDescription = normalizeRichTextHtml(brand.description);

  return (
    <div className="container-narrow py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Бренды", href: "/brands" },
          { label: brand.title },
        ]}
      />

      <BrandHero brand={brand} />

      <CatalogProvider>
        <div className="etis-cat-layout">
          {/* data-lenis-prevent — иначе Lenis забирает колесо себе
              и внутренний скролл панели не работает */}
          <aside className="etis-cat-aside" data-lenis-prevent>
            {filtersPanel}
          </aside>

          {/* data-catalog-top — якорь, к которому провайдер плавно
              поднимает страницу при смене фильтров и пагинации */}
          <div className="etis-cat-results" data-catalog-top>
            <CatalogToolbar total={meta.total} />
            <ActiveFilters categories={facets.categories} brands={[]} />
            <CatalogGrid products={products} />
            <CatalogPagination meta={meta} />
          </div>
        </div>

        <MobileFiltersDrawer total={meta.total}>{filtersPanel}</MobileFiltersDrawer>
      </CatalogProvider>

      {/* Полное описание бренда — под товарами, как в разделах каталога */}
      {normalizedDescription && (
        <section
          className="etis-cat-seo prose-simple brand-description"
          data-rich-text
          dangerouslySetInnerHTML={{ __html: normalizedDescription }}
        />
      )}
    </div>
  );
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
