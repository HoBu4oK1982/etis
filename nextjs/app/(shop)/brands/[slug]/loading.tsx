import "@/components/catalog/catalog.css";
import "@/components/brands/brands.css";

/** Скелет страницы бренда: шапка + сайдбар + сетка товаров. */
export default function BrandLoading() {
  return (
    <div className="container-narrow py-6 md:py-10">
      <div className="etis-cat-skeleton__crumbs" />

      <div className="etis-brands__skeleton" style={{ height: 200, borderRadius: 22 }} />

      <div className="etis-cat-layout" style={{ marginTop: 26 }}>
        <div className="etis-cat-skeleton__panel" />

        <div>
          <div className="etis-cat-skeleton__toolbar" />
          <div className="etis-cat-grid" style={{ marginTop: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="etis-cat-skeleton__card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
