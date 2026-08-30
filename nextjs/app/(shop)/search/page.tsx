import { Metadata } from "next";
import Link from "next/link";
import { searchAll } from "@/lib/api/search";
import type { SearchResultItem, SearchResponse } from "@/lib/types/search";
import { ProductCard } from "@/components/product/ProductCard";
import { EntityCard } from "@/components/search/EntityCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { searchItemToProduct } from "@/lib/utils/search-mappers";
import "@/components/search/searchPage.css";

export const dynamic = "force-dynamic";

/* ---------- Фильтры ---------- */

type SearchFilter = "all" | "product" | "category" | "brand" | "article";

const FILTERS: Array<{ key: SearchFilter; label: string; types: string[] }> = [
  { key: "all",      label: "Все",        types: [] },
  { key: "product",  label: "Товары",     types: ["product"] },
  { key: "category", label: "Категории",  types: ["category"] },
  { key: "brand",    label: "Бренды",     types: ["brand"] },
  { key: "article",  label: "Статьи",     types: ["article"] },
];

function normalizeFilter(value: unknown): SearchFilter {
  const v = Array.isArray(value) ? value[0] : value;
  return FILTERS.some((f) => f.key === v) ? (v as SearchFilter) : "all";
}

function filterResults(results: SearchResultItem[], filter: SearchFilter): SearchResultItem[] {
  if (filter === "all") return results;
  const rule = FILTERS.find((f) => f.key === filter);
  if (!rule || rule.types.length === 0) return results;
  return results.filter((r) => rule.types.includes(r.type));
}

function countForFilter(
  groups: SearchResponse["groups"] = {},
  filter: SearchFilter,
  total: number,
): number {
  if (filter === "all") return total;
  const rule = FILTERS.find((f) => f.key === filter);
  if (!rule) return 0;
  return rule.types.reduce((sum, type) => sum + (groups[type]?.length || 0), 0);
}

/* ---------- Metadata ---------- */

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = (params.q || "").trim();
  return {
    title: q ? `Поиск: ${q}` : "Поиск",
    robots: { index: false, follow: true },
  };
}

/* ============================================================
   Страница
   ============================================================ */

type SearchPageProps = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q || "").trim();
  const selectedFilter = normalizeFilter(params.type);

  const crumbs = [
    { label: "Главная", href: "/" },
    { label: query ? `Поиск: ${query}` : "Поиск" },
  ];

  /* ---------- Пустой запрос ---------- */
  if (query.length < 2) {
    return (
      <div className="searchPage">
        <div className="container-narrow py-8">
          <Breadcrumbs items={crumbs} />

          <section className="searchHero">
            <div className="searchHero__content">
              <div>
                <span className="searchHero__eyebrow">Умный поиск etis.kz</span>
                <h1 className="searchHero__title">Введите запрос</h1>
                <p className="searchHero__note">
                  Ищем по названию, категории, бренду, SKU и описанию.
                  Понимаем опечатки, синонимы и раскладку клавиатуры.
                </p>
              </div>
            </div>
          </section>

          <section className="searchEmpty">
            <h2 className="searchEmpty__title">Например</h2>
            <p className="searchEmpty__text">
              Котёл газовый, радиатор биметаллический, сплит-система,
              циркуляционный насос, тёплый пол, конвектор, тепловой насос.
            </p>
            <Link href="/shop" className="searchEmpty__link">
              Перейти в каталог
            </Link>
          </section>
        </div>
      </div>
    );
  }

  /* ---------- Загружаем результаты ---------- */
  let data: SearchResponse = {
    query,
    corrected: null,
    total: 0,
    results: [],
    groups: {},
  };
  try {
    data = await searchAll(query, undefined, 120);
  } catch (e) {
    console.error("Search page: API failed", e);
  }

  const results = filterResults(data.results || [], selectedFilter);

  return (
    <div className="searchPage">
      <div className="container-narrow py-8">
        <Breadcrumbs items={crumbs} />

        {/* Hero */}
        <section className="searchHero">
          <div className="searchHero__content">
            <div>
              <span className="searchHero__eyebrow">Умный поиск etis.kz</span>
              <h1 className="searchHero__title">
                Результаты по запросу{" "}
                <span className="searchHero__query">«{query}»</span>
              </h1>
              {data.corrected?.query && data.corrected.query !== query ? (
                <p className="searchHero__note">
                  Показаны результаты с исправлением: <b>{data.corrected.query}</b>
                </p>
              ) : (
                <p className="searchHero__note">
                  Учитываем название, категорию, бренд, SKU, ключевые слова,
                  синонимы, опечатки и раскладку клавиатуры.
                </p>
              )}
            </div>

            <div className="searchHero__meta" aria-label="Количество результатов">
              <span className="searchHero__count">{results.length}</span>
              <span className="searchHero__label">в текущем фильтре</span>
            </div>
          </div>
        </section>

        {/* Вкладки фильтров */}
        <nav className="searchTabs" aria-label="Фильтры результатов поиска">
          {FILTERS.map((filter) => {
            const count = countForFilter(data.groups, filter.key, data.total);
            const active = selectedFilter === filter.key;
            const href =
              filter.key === "all"
                ? `/search?q=${encodeURIComponent(query)}`
                : `/search?q=${encodeURIComponent(query)}&type=${filter.key}`;

            return (
              <Link
                key={filter.key}
                href={href}
                className={`searchTab ${active ? "is-active" : ""}`}
              >
                <span>{filter.label}</span>
                <span className="searchTab__count">{count}</span>
              </Link>
            );
          })}
        </nav>

        {/* Сетка результатов */}
        {results.length > 0 ? (
          <section
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
            aria-label="Результаты поиска"
          >
            {results.map((item) =>
              item.type === "product" ? (
                <ProductCard
                  key={`product-${item.id}`}
                  product={searchItemToProduct(item)}
                />
              ) : (
                <EntityCard key={`${item.type}-${item.id}`} item={item} />
              ),
            )}
          </section>
        ) : (
          <section className="searchEmpty">
            <h2 className="searchEmpty__title">Ничего не найдено</h2>
            <p className="searchEmpty__text">
              Попробуйте изменить запрос или проверьте раскладку клавиатуры.
              Запрос сохранится в лог «нет результата» — по нему видно, каких
              товаров или синонимов не хватает в каталоге.
            </p>
            <Link href="/shop" className="searchEmpty__link">
              Перейти в каталог
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
