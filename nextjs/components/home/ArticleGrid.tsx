import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ArticlePreview } from "@/lib/types/home";
import type { ArticleItem } from "@/lib/api/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import "@/components/articles/articles.css";

export function ArticleGrid({ articles }: { articles: ArticlePreview[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="article-grid-section container-narrow mt-16 md:mt-20">
      <div className="article-grid-heading">
        <div>
          <h2>Полезные статьи</h2>
          <p>Как выбрать оборудование и правильно его эксплуатировать</p>
        </div>

        <Link href="/articles" className="article-grid-heading__link">
          Все статьи
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      <section className="etis-articles-grid">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article as unknown as ArticleItem}
          />
        ))}
      </section>
    </section>
  );
}
