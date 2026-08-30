import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Headphones,
  Newspaper,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleMotion } from "@/components/articles/ArticleMotion";
import { getArticle, getArticles } from "@/lib/api/articles";
import { articlePlainText, prepareArticleHtml } from "@/lib/utils/article-html";
import { normalizeImageUrl } from "@/lib/utils/image";
import "@/components/articles/articles.css";

export const revalidate = 600;

type PageProps = { params: Promise<{ slug: string }> };

const DATE = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await getArticle(slug);
    const description =
      article.meta?.description || articlePlainText(article.excerpt || article.content).slice(0, 170);
    const image = normalizeImageUrl(article.image);

    return {
      title: article.meta?.title || article.title,
      description: description || undefined,
      keywords: article.meta?.keywords || undefined,
      alternates: { canonical: `/article/${article.slug}` },
      openGraph: {
        type: "article",
        title: article.meta?.title || article.title,
        description: description || undefined,
        url: `/article/${article.slug}`,
        publishedTime: article.created_at || undefined,
        modifiedTime: article.updated_at || undefined,
        images: image ? [{ url: image, alt: article.title }] : undefined,
      },
    };
  } catch {
    return { title: "Статья | ETIS.KZ" };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  let article;
  try {
    article = await getArticle(slug);
  } catch {
    notFound();
  }

  const html = prepareArticleHtml(article.content);
  const image = normalizeImageUrl(article.image);
  const date = article.created_at ? DATE.format(new Date(article.created_at)) : null;
  const relatedResponse = await getArticles(1).catch(() => null);
  const related = (relatedResponse?.data || [])
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://etis.kz").replace(/\/+$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta?.description || articlePlainText(article.excerpt || article.content).slice(0, 220),
    image: image ? [image] : undefined,
    datePublished: article.created_at || undefined,
    dateModified: article.updated_at || article.created_at || undefined,
    mainEntityOfPage: `${siteUrl}/article/${article.slug}`,
    author: { "@type": "Organization", name: "ETIS.KZ" },
    publisher: { "@type": "Organization", name: "ETIS.KZ", url: siteUrl },
  };

  return (
    <ArticleMotion detail>
      <div className="etis-article-progress" aria-hidden="true">
        <span data-article-progress />
      </div>

      <main className="etis-article-page">
        <div className="container-narrow py-6 md:py-10">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Блог", href: "/articles" },
              { label: article.title },
            ]}
          />

          <header className="etis-article-hero" data-article-hero>
            <div className="etis-article-hero__copy">
              <span className="etis-article-hero__eyebrow">
                <Newspaper size={15} /> Статья ETIS.KZ
              </span>
              <h1>{article.title}</h1>
              {article.excerpt && <p>{articlePlainText(article.excerpt)}</p>}
              <div className="etis-article-hero__meta">
                {date && <span><CalendarDays size={16} />{date}</span>}
                <span><Clock3 size={16} />{article.reading_time || 3} мин. чтения</span>
              </div>
            </div>

            {image ? (
              <div className="etis-article-hero__image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={article.title} />
              </div>
            ) : (
              <div className="etis-article-hero__image etis-article-hero__image--fallback">
                <Newspaper size={72} />
                <b>ETIS.KZ</b>
              </div>
            )}
          </header>

          <div className="etis-article-layout">
            <article className="etis-article-content" data-article-content data-rich-text>
              {html ? (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <p>Содержание статьи пока не заполнено.</p>
              )}
            </article>

            <aside className="etis-article-aside">
              <div className="etis-article-aside__card">
                <Headphones size={26} />
                <h2>Нужна помощь с подбором?</h2>
                <p>Инженер ETIS.KZ уточнит параметры объекта и предложит подходящее оборудование.</p>
                <Link href="/contacts">Получить консультацию</Link>
              </div>

              <Link href="/articles" className="etis-article-aside__back">
                <ArrowLeft size={17} /> Все статьи
              </Link>
            </aside>
          </div>

          {related.length > 0 && (
            <section className="etis-article-related">
              <div className="etis-article-related__head">
                <div>
                  <span>Продолжить чтение</span>
                  <h2>Другие полезные материалы</h2>
                </div>
                <Link href="/articles">Все статьи</Link>
              </div>
              <div className="etis-articles-grid">
                {related.map((item) => <ArticleCard key={item.id} article={item} />)}
              </div>
            </section>
          )}
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </ArticleMotion>
  );
}
