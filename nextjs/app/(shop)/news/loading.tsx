import "@/components/catalog/catalog.css";
import "@/components/catalog/remark-page.css";

/** Скелет страниц /hits, /sales, /news — hero-полоса + сайдбар + сетка. */
export default function RemarkLoading() {
  return (
    <div className="container-narrow py-6 md:py-10">
      <div className="etis-cat-skeleton__crumbs" />

      <div className="etis-remark-hero-skeleton" />

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
