import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, Newspaper } from "lucide-react";
import type { ArticleItem } from "@/lib/api/articles";
import { normalizeImageUrl } from "@/lib/utils/image";
import { articlePlainText } from "@/lib/utils/article-html";

const DATE = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function ArticleCard({
  article,
  featured = false,
}: {
  article: ArticleItem;
  featured?: boolean;
}) {
  const image = normalizeImageUrl(article.image);
  const excerpt = articlePlainText(article.excerpt);
  const date = article.created_at ? DATE.format(new Date(article.created_at)) : null;

  return (
    <article
      className={`etis-article-card${featured ? " etis-article-card--featured" : ""}`}
      data-article-card
    >
      <Link href={`/article/${article.slug}`} className="etis-article-card__media" aria-label={article.title}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={article.title} loading={featured ? "eager" : "lazy"} />
        ) : (
          <span className="etis-article-card__fallback" aria-hidden="true">
            <Newspaper size={featured ? 68 : 52} />
            <b>ETIS.KZ</b>
          </span>
        )}
        <span className="etis-article-card__label">Полезная статья</span>
      </Link>

      <div className="etis-article-card__body">
        <div className="etis-article-card__meta">
          {date && (
            <span><CalendarDays size={14} />{date}</span>
          )}
          <span><Clock3 size={14} />{article.reading_time || 3} мин.</span>
        </div>

        <h2>
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </h2>

        {excerpt && <p>{excerpt}</p>}

        <Link href={`/article/${article.slug}`} className="etis-article-card__link">
          Читать статью
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
