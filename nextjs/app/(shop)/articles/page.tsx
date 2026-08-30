import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Newspaper, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleMotion } from "@/components/articles/ArticleMotion";
import { ArticleSortControl } from "@/components/articles/ArticleSortControl";
import {
  EMPTY_ARTICLES_RESPONSE,
  getSortedArticles,
  type ArticleSort,
} from "@/lib/api/articles";
import "@/components/articles/articles.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Блог об инженерном оборудовании и системах | ETIS.KZ",
  description:
    "Полезные статьи ETIS.KZ об отоплении, водоснабжении, кондиционировании, котлах, насосах, горелках и эксплуатации инженерного оборудования.",
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "Полезные статьи ETIS.KZ",
    description: "Практические материалы об инженерных системах и оборудовании.",
    type: "website",
    url: "/articles",
  },
};

type PageProps = {
  searchParams: Promise<{ page?: string; sort?: string }>;
};

function positivePage(value: string | undefined): number {
  const parsed = Number.parseInt(value || "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeSort(value: string | undefined): ArticleSort {
  return value === "oldest" ? "oldest" : "newest";
}

function pageHref(page: number, sort: ArticleSort): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (sort === "oldest") params.set("sort", sort);

  const query = params.toString();
  return query ? `/articles?${query}` : "/articles";
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedPage = positivePage(params.page);
  const sort = normalizeSort(params.sort);
  const response = await getSortedArticles(requestedPage, sort).catch(
    () => EMPTY_ARTICLES_RESPONSE,
  );
  const articles = response.data || [];
  const currentPage = response.meta.current_page || requestedPage;
  const lastPage = Math.max(1, response.meta.last_page || 1);

  return (
    <ArticleMotion key={`${sort}-${currentPage}`}>
      <main className="etis-articles-page">
        <div className="container-narrow py-6 md:py-10">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Блог" }]} />

          <section className="etis-articles-hero" data-article-hero>
            <div className="etis-articles-hero__copy">
              <span className="etis-articles-hero__eyebrow">
                <Sparkles size={16} /> База знаний ETIS.KZ
              </span>
              <h1>Полезные статьи об инженерных системах</h1>
              <p>
                Разбираем оборудование без лишней теории: подбор, монтаж,
                эксплуатация, обслуживание и способы избежать дорогих ошибок.
              </p>
            </div>

            <div className="etis-articles-hero__media" aria-hidden="true" />
          </section>

          {articles.length ? (
            <>
              <div className="etis-articles-toolbar">
                <div>
                  <span>Блог ETIS.KZ</span>
                  <h2>Все статьи</h2>
                </div>
                <ArticleSortControl value={sort} />
              </div>

              <section className="etis-articles-grid" aria-label="Все статьи">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </section>

              {lastPage > 1 && (
                <nav className="etis-articles-pagination" aria-label="Страницы блога">
                  {currentPage > 1 ? (
                    <Link
                      href={pageHref(currentPage - 1, sort)}
                      aria-label="Предыдущая страница"
                    >
                      <ChevronLeft size={18} />
                    </Link>
                  ) : (
                    <span aria-hidden="true"><ChevronLeft size={18} /></span>
                  )}

                  {Array.from({ length: lastPage }, (_, index) => index + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === lastPage ||
                        Math.abs(page - currentPage) <= 1,
                    )
                    .map((page, index, visible) => {
                      const previous = visible[index - 1];
                      return (
                        <span key={page} className="etis-articles-pagination__group">
                          {previous && page - previous > 1 && <i>…</i>}
                          <Link
                            href={pageHref(page, sort)}
                            aria-current={page === currentPage ? "page" : undefined}
                            className={page === currentPage ? "is-active" : ""}
                          >
                            {page}
                          </Link>
                        </span>
                      );
                    })}

                  {currentPage < lastPage ? (
                    <Link
                      href={pageHref(currentPage + 1, sort)}
                      aria-label="Следующая страница"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  ) : (
                    <span aria-hidden="true"><ChevronRight size={18} /></span>
                  )}
                </nav>
              )}
            </>
          ) : (
            <section className="etis-articles-empty">
              <Newspaper size={38} />
              <h2>Статьи пока не опубликованы</h2>
              <p>Добавьте материал в Laravel-админке — он автоматически появится здесь.</p>
              <Link href="/shop">Перейти в каталог</Link>
            </section>
          )}
        </div>
      </main>
    </ArticleMotion>
  );
}
