import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CatalogProvider } from "@/components/catalog/CatalogProvider";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { ActiveFilters } from "@/components/catalog/ActiveFilters";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { MobileFiltersDrawer } from "@/components/catalog/MobileFiltersDrawer";
import { RemarkHero } from "@/components/catalog/RemarkHero";
import { RemarkFiltersPanel } from "@/components/catalog/RemarkFiltersPanel";
import { EMPTY_SHOP_RESPONSE, getShopProducts } from "@/lib/api/shop";
import type { CatalogRemark } from "@/lib/types/catalog";
import { parseCatalogParams } from "@/lib/utils/catalog-params";
import { REMARK_META } from "@/lib/utils/remark-meta";

type Props = {
  remark: CatalogRemark;
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Общий view для страниц /hits, /sales, /news.
 *
 * По сути — то же, что /shop, но с зафиксированным параметром remark
 * (задан маршрутом, а не пользователем). Все остальные фильтры (категория,
 * бренды, цена, сортировка) работают штатно. Категории приходят из facets
 * — так счётчики отражают именно текущую подборку, а не весь каталог.
 */
export async function RemarkPageView({ remark, searchParams }: Props) {
  const meta = REMARK_META[remark];
  const parsed = parseCatalogParams(searchParams);

  // remark всегда навязан маршрутом, что бы ни было в URL
  const catalogParams = { ...parsed, remark };

  let response;
  try {
    response = await getShopProducts(catalogParams);
  } catch {
    response = EMPTY_SHOP_RESPONSE;
  }

  const products = response.data ?? [];
  const total = response.meta?.total ?? 0;
  const paginationMeta = response.meta ?? EMPTY_SHOP_RESPONSE.meta;
  const facets = response.filters ?? EMPTY_SHOP_RESPONSE.filters!;
  const categories = facets.categories ?? [];

  const filtersPanel = (
    <RemarkFiltersPanel
      categories={categories}
      brands={facets.brands}
      price={facets.price}
    />
  );

  return (
    <div className="container-narrow py-6 md:py-10">
      <Breadcrumbs
        items={[{ label: "Главная", href: "/" }, { label: meta.title }]}
      />

      <RemarkHero remark={remark} total={total} />

      <CatalogProvider>
        <div className="etis-cat-layout">
          <aside className="etis-cat-aside" data-lenis-prevent>
            {filtersPanel}
          </aside>

          <div className="etis-cat-results" data-catalog-top>
            <CatalogToolbar total={total} />
            <ActiveFilters categories={categories} brands={facets.brands} hideRemark />
            <CatalogGrid products={products} />
            <CatalogPagination meta={paginationMeta} />
          </div>
        </div>

        <MobileFiltersDrawer total={total}>{filtersPanel}</MobileFiltersDrawer>
      </CatalogProvider>
    </div>
  );
}
