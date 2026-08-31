import { notFound } from "next/navigation";
import { getCategory, getCategoryProducts } from "@/lib/api/categories";
import { parseCatalogParams } from "@/lib/utils/catalog-params";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CatalogProvider } from "@/components/catalog/CatalogProvider";
import { CategoryFiltersPanel } from "@/components/catalog/CategoryFiltersPanel";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { ActiveFilters } from "@/components/catalog/ActiveFilters";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { MobileFiltersDrawer } from "@/components/catalog/MobileFiltersDrawer";
import { EMPTY_SHOP_RESPONSE } from "@/lib/api/shop";
import type { CategoryProductsResponse } from "@/lib/api/categories";
import { normalizeRichTextHtml } from "@/lib/utils/image";
import { CategorySeoText } from "@/components/catalog/CategorySeoText";
import { CategorySchema } from "@/components/seo/SchemaOrg";
import type { Crumb } from "@/components/seo/JsonLd";

type Props = {
  slug: string;
  /** Сегменты пути после корня: ["nasosy", "cirkulyacionnye"] */
  path: string[];
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Общий вид страницы категории — используется и для корневой
 * (/category/{slug}), и для вложенной (/category/{slug}/{path*}).
 *
 * Товары берутся из всего поддерева текущей категории, слева —
 * аккордеон подкатегорий и фильтры, справа — сетка с сортировкой
 * и пагинацией. Состояние фильтров живёт в URL.
 */
export async function CategoryPageView({ slug, path, searchParams }: Props) {
  const params = parseCatalogParams(searchParams);
  const pathString = path.join("/");

  let data;
  try {
    data = await getCategory(slug, pathString || undefined);
  } catch {
    notFound();
  }

  let response: CategoryProductsResponse;
  try {
    response = await getCategoryProducts(slug, {
      path: pathString || undefined,
      brand_id: params.brands.length ? params.brands.join(",") : undefined,
      remark: params.remark,
      price_from: params.price_from,
      price_to: params.price_to,
      sort: params.sort !== "default" ? params.sort : undefined,
      page: params.page > 1 ? params.page : undefined,
      per_page: params.per_page,
    });
  } catch {
    response = EMPTY_SHOP_RESPONSE;
  }

  const products = response.data ?? [];
  const meta = response.meta ?? EMPTY_SHOP_RESPONSE.meta;
  const facets = response.filters ?? EMPTY_SHOP_RESPONSE.filters!;

  const { root, current, tree, breadcrumbs, counts } = data;
  const normalizedDescription = normalizeRichTextHtml(current.description);

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/shop" },
    ...breadcrumbs.map((b, i) => ({
      label: b.title,
      href: i === breadcrumbs.length - 1 ? undefined : b.url,
    })),
  ];

  // Текст без тегов — нужен и для порога сворачивания, и для description
  // в CollectionPage, куда HTML класть нельзя.
  const plainDescription = normalizedDescription
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const canonicalPath = pathString
    ? `/category/${slug}/${pathString}`
    : `/category/${slug}`;

  const schemaCrumbs: Crumb[] = crumbs.map((crumb) => ({
    name: crumb.label,
    url: crumb.href,
  }));

  const filtersPanel = (
    <CategoryFiltersPanel
      tree={tree}
      rootSlug={root.slug}
      pathSegments={data.path_segments ?? []}
      counts={counts}
      brands={facets.brands}
      price={facets.price}
    />
  );

  return (
    <div className="container-narrow py-6 md:py-10">
      <CategorySchema
        name={current.meta?.title || current.title}
        description={
          current.meta?.description ||
          current.short_description ||
          plainDescription.slice(0, 300) ||
          null
        }
        url={canonicalPath}
        crumbs={schemaCrumbs}
      />

      <Breadcrumbs items={crumbs} />

      <header className="etis-cat-head">
        <div>
          <h1>{current.title}</h1>
          {current.subtitle && <p className="etis-cat-head__sub">{current.subtitle}</p>}
          {current.short_description && (
            <p className="etis-cat-head__text">{current.short_description}</p>
          )}
        </div>

        <span className="etis-cat-head__count">
          {meta.total.toLocaleString("ru-RU")} товаров
        </span>
      </header>

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
            <ActiveFilters categories={[]} brands={facets.brands} />
            <CatalogGrid products={products} />
            <CatalogPagination meta={meta} />
          </div>
        </div>

        <MobileFiltersDrawer total={meta.total}>{filtersPanel}</MobileFiltersDrawer>
      </CatalogProvider>

      {/* Описание раздела — под товарами, как принято в SEO-каталогах */}
      {normalizedDescription && (
        <CategorySeoText
          html={normalizedDescription}
          plainLength={plainDescription.length}
        />
      )}
    </div>
  );
}
