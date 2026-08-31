import { API_URL } from "@/lib/api/config";
import type { CategoryTreeNode } from "@/lib/types/category";
import type { Paginated } from "@/lib/types/api";
import type { ProductListItem } from "@/lib/types/product";
import type { BrandsResponse } from "@/lib/types/brand";
import type { Article } from "@/lib/types/misc";

// SITE_URL живёт в lib/seo/site.ts. Импортируем для локального
// использования и реэкспортируем, чтобы не ломать существующие
// импорты (robots.ts и др.).
import { SITE_URL } from "./site";

export { SITE_URL };

export type SiteMapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

type CategoryTreeResponse = { data: CategoryTreeNode[] };


const STATIC_ENTRIES: SiteMapEntry[] = [
  { url: "/", changeFrequency: "daily", priority: 1 },
  { url: "/shop", changeFrequency: "daily", priority: 0.95 },
  { url: "/brands", changeFrequency: "weekly", priority: 0.8 },
  { url: "/articles", changeFrequency: "weekly", priority: 0.75 },
  { url: "/hits", changeFrequency: "daily", priority: 0.8 },
  { url: "/news", changeFrequency: "daily", priority: 0.8 },
  { url: "/sales", changeFrequency: "daily", priority: 0.8 },
  { url: "/delivery", changeFrequency: "monthly", priority: 0.55 },
  { url: "/about", changeFrequency: "monthly", priority: 0.55 },
  { url: "/contacts", changeFrequency: "monthly", priority: 0.55 },
  { url: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { url: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

function absolute(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_URL}/${path.replace(/^\/+/, "")}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Sitemap API ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

function categoryEntries(nodes: CategoryTreeNode[]): SiteMapEntry[] {
  const result: SiteMapEntry[] = [];

  const visit = (
    node: CategoryTreeNode,
    rootSlug: string,
    nestedSegments: string[]
  ) => {
    const path =
      nestedSegments.length === 0
        ? `/category/${rootSlug}`
        : `/category/${rootSlug}/${nestedSegments.join("/")}`;

    result.push({
      url: path,
      changeFrequency: "weekly",
      priority: nestedSegments.length === 0 ? 0.85 : 0.75,
    });

    for (const child of node.children || []) {
      visit(child, rootSlug, [...nestedSegments, child.slug]);
    }
  };

  for (const root of nodes) visit(root, root.slug, []);
  return result;
}

async function loadProducts(): Promise<ProductListItem[]> {
  const first = await fetchJson<Paginated<ProductListItem>>(
    "products?per_page=60&page=1"
  );

  const pages = Math.min(Math.max(first.meta?.last_page || 1, 1), 1000);
  if (pages === 1) return first.data || [];

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      fetchJson<Paginated<ProductListItem>>(
        `products?per_page=60&page=${index + 2}`
      )
    )
  );

  return [first, ...rest].flatMap((page) => page.data || []);
}


async function loadArticles(): Promise<Article[]> {
  const first = await fetchJson<Paginated<Article>>(
    "articles?page=1"
  );

  const pages = Math.min(Math.max(first.meta?.last_page || 1, 1), 1000);
  if (pages === 1) return first.data || [];

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      fetchJson<Paginated<Article>>(`articles?page=${index + 2}`)
    )
  );

  return [first, ...rest].flatMap((page) => page.data || []);
}

export async function buildSiteMapEntries(): Promise<SiteMapEntry[]> {
  const entries: SiteMapEntry[] = [...STATIC_ENTRIES];

  const [categories, brands, products, articles] = await Promise.allSettled([
    fetchJson<CategoryTreeResponse>("categories/tree"),
    fetchJson<BrandsResponse>("brands"),
    loadProducts(),
    loadArticles(),
  ]);

  if (categories.status === "fulfilled") {
    entries.push(...categoryEntries(categories.value.data || []));
  }

  if (brands.status === "fulfilled") {
    for (const brand of brands.value.data || []) {
      if (!brand.slug || brand.products_count <= 0) continue;
      entries.push({
        url: `/brands/${brand.slug}`,
        changeFrequency: "weekly",
        priority: 0.72,
      });
    }
  }

  if (products.status === "fulfilled") {
    for (const product of products.value) {
      if (!product.slug) continue;
      entries.push({
        url: `/product/${product.slug}`,
        changeFrequency: "weekly",
        priority: 0.78,
      });
    }
  }

  if (articles.status === "fulfilled") {
    for (const article of articles.value) {
      if (!article.slug) continue;
      entries.push({
        url: `/article/${article.slug}`,
        lastModified: article.created_at ? new Date(article.created_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.66,
      });
    }
  }


  const unique = new Map<string, SiteMapEntry>();
  for (const entry of entries) {
    const url = absolute(entry.url);
    unique.set(url, { ...entry, url });
  }

  return [...unique.values()];
}
