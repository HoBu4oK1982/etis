import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { SwipeHint } from "@/components/ui/SwipeHint";
import type { ProductListItem } from "@/lib/types/product";

type Props = {
  title: string;
  subtitle?: string;
  href: string;
  products: ProductListItem[];
  accent?: "default" | "rose";
};

export function ProductSection({ title, subtitle, href, products, accent = "default" }: Props) {
  if (products.length === 0) return null;

  const titleClass = accent === "rose" ? "text-rose-600" : "";

  return (
    <section className="home-product-section container-narrow mt-16 md:mt-20">
      <div className="home-product-section__head flex items-end justify-between mb-8">
        <div className="min-w-0">
          <h2 className={`home-product-section__title text-2xl md:text-3xl font-extrabold tracking-tight ${titleClass}`}>
            {title}
          </h2>
          {subtitle && <p className="home-product-section__subtitle text-ink-600 mt-1">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="home-product-section__link inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 whitespace-nowrap shrink-0"
        >
          Смотреть все
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Wrapper с position: relative — над карточками "висит"
          круглая подсказка-рука, наезжающая на верхнюю кромку первой карточки. */}
      <div className="home-product-section__gridWrap">
        <SwipeHint className="home-product-section__hint" />
        <div className="home-product-section__grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
