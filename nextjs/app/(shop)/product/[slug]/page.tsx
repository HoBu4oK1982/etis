import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api/products";
import { getCategoryTree } from "@/lib/api/categories";
import type { CategoryTreeNode } from "@/lib/types/category";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { SimilarProducts } from "@/components/product/SimilarProducts";
import "@/components/product/product-detail.css";
import type { Metadata } from "next";
import { ProductSchema } from "@/components/seo/SchemaOrg";
import { ogDescription } from "@/lib/seo/site";
import type { Crumb } from "@/components/seo/JsonLd";

// ISR: 10 минут (см. REVALIDATE.product)
export const revalidate = 600;

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Находит полную цепочку категории внутри дерева: root -> ... -> current.
 * В ProductResource приходит только slug текущей категории, поэтому ссылка
 * вида /category/{child-slug} ломалась для вложенных категорий.
 */
function findCategoryTrail(
  nodes: CategoryTreeNode[],
  categoryId: number,
  trail: CategoryTreeNode[] = [],
): CategoryTreeNode[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node];

    if (node.id === categoryId) {
      return nextTrail;
    }

    if (node.children?.length) {
      const found = findCategoryTrail(node.children, categoryId, nextTrail);
      if (found) return found;
    }
  }

  return null;
}

function categoryTrailToBreadcrumbs(trail: CategoryTreeNode[]): BreadcrumbItem[] {
  if (!trail.length) return [];

  const root = trail[0];

  return trail.map((node, index) => {
    const nestedPath = trail
      .slice(1, index + 1)
      .map((part) => part.slug)
      .join("/");

    return {
      label: node.title,
      href:
        index === 0
          ? `/category/${root.slug}`
          : `/category/${root.slug}/${nestedPath}`,
    };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await getProduct(slug);
    const p = res.data;
    const title = p.meta?.title || p.title;
    const description = p.meta?.description || p.short_description || undefined;
    const image = p.images?.[0]?.url;

    return {
      title,
      description,
      keywords: p.meta?.keywords || undefined,
      alternates: { canonical: `/product/${p.slug}` },
      openGraph: {
        type: "website",
        siteName: "ETIS.KZ",
        title,
        description: ogDescription(description),
        url: `/product/${p.slug}`,
        images: image ? [{ url: image, alt: p.title }] : undefined,
      },
    };
  } catch {
    return { title: "Товар" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let data;
  try {
    data = await getProduct(slug);
  } catch {
    notFound();
  }

  const product = data.data;
  const related = data.related?.data ?? [];

  let categoryCrumbs: BreadcrumbItem[] = [];

  if (product.category) {
    try {
      const categoryTree = await getCategoryTree();
      const trail = findCategoryTrail(categoryTree, product.category.id);

      if (trail) {
        categoryCrumbs = categoryTrailToBreadcrumbs(trail);
      } else {
        // Не создаём потенциально битую ссылку, если категория не найдена в дереве.
        categoryCrumbs = [{ label: product.category.title }];
      }
    } catch {
      categoryCrumbs = [{ label: product.category.title }];
    }
  }

  const crumbs: BreadcrumbItem[] = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/shop" },
    ...categoryCrumbs,
    { label: product.title },
  ];

  const schemaCrumbs: Crumb[] = crumbs.map((crumb) => ({
    name: crumb.label,
    url: crumb.href,
  }));

  return (
    <div className="container-narrow py-6 md:py-10">
      <ProductSchema
        product={product}
        url={`/product/${product.slug}`}
        crumbs={schemaCrumbs}
      />

      <Breadcrumbs items={crumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] gap-5">
        <ProductGallery images={product.images} alt={product.title} />
        <ProductInfo product={product} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] gap-5 mt-5">
        <ProductTabs product={product} />
        <ProductFeatures />
      </div>

      {related.length > 0 && <SimilarProducts products={related} />}
    </div>
  );
}
