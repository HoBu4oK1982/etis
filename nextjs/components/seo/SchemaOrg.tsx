import { JsonLd, absoluteUrl, breadcrumbList, type Crumb } from "./JsonLd";
import {
  ORGANIZATION_LOGO,
  SALES_PHONE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";
import type { Product } from "@/lib/types/product";

/**
 * Organization — на всех страницах через корневой layout.
 * @id даёт остальным схемам возможность ссылаться на организацию,
 * а не дублировать её описание.
 */
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: ORGANIZATION_LOGO,
        description: SITE_DESCRIPTION,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Алматы",
          addressCountry: "KZ",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: SALES_PHONE,
          contactType: "sales",
          areaServed: "KZ",
          availableLanguage: ["ru", "kk"],
        },
      }}
    />
  );
}

/** WebSite + SearchAction — только на главной. */
export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/** CollectionPage + BreadcrumbList — страницы категорий. */
export function CategorySchema({
  name,
  description,
  url,
  crumbs,
}: {
  name: string;
  description?: string | null;
  url: string;
  crumbs: Crumb[];
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name,
          ...(description ? { description } : {}),
          url: absoluteUrl(url),
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />
      <JsonLd data={breadcrumbList(crumbs)} />
    </>
  );
}

/**
 * Product + Offer + BreadcrumbList — страница товара.
 *
 * availability: колонки qty в products нет (см. ProductResource на бэке),
 * поэтому наличие выводим из status (0 = опубликован) и наличия цены.
 * Появится остаток — заменить условие здесь.
 */
export function ProductSchema({
  product,
  url,
  crumbs,
}: {
  product: Product;
  url: string;
  crumbs: Crumb[];
}) {
  const price = product.effective_price ?? product.price;
  const inStock = product.status === 0 && typeof price === "number" && price > 0;
  const images = product.images.map((image) => image.url).filter(Boolean);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          ...(product.meta?.description || product.short_description
            ? { description: product.meta?.description || product.short_description }
            : {}),
          ...(product.sku ? { sku: product.sku } : {}),
          ...(images.length ? { image: images } : {}),
          ...(product.brand
            ? { brand: { "@type": "Brand", name: product.brand.title } }
            : {}),
          offers: {
            "@type": "Offer",
            ...(typeof price === "number" ? { price } : {}),
            priceCurrency: "KZT",
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: absoluteUrl(url),
            seller: { "@id": `${SITE_URL}/#organization` },
          },
        }}
      />
      <JsonLd data={breadcrumbList(crumbs)} />
    </>
  );
}
