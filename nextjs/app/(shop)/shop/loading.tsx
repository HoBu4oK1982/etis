import "@/components/catalog/catalog.css";

/** Скелет страницы /shop — сетка карточек категорий. */
export default function ShopLoading() {
  return (
    <div className="container-narrow py-6 md:py-10">
      <div className="etis-cat-skeleton__crumbs" />

      <div className="etis-cat-showcase">
        <div className="etis-cat-showcase__head">
          <div style={{ width: "100%" }}>
            <div className="etis-cat-skeleton__heading" />
            <div className="etis-cat-skeleton__line" />
          </div>
        </div>

        <div className="etis-cat-showcase__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="etis-cat-skeleton__tile" />
          ))}
        </div>
      </div>
    </div>
  );
}
