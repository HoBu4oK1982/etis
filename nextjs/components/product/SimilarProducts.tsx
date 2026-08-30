import type { ProductListItem } from "@/lib/types/product";
import { ProductCard } from "./ProductCard";

export function SimilarProducts({ products }: { products: ProductListItem[] }) {
  if (!products.length) return null;

  return (
    <div className="etis-similar">
      <h2 className="etis-similar__title">Похожие товары</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
