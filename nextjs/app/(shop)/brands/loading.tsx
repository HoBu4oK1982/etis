import "@/components/catalog/catalog.css";
import "@/components/brands/brands.css";

/** Скелет витрины брендов. */
export default function BrandsLoading() {
  return (
    <div className="container-narrow py-6 md:py-10">
      <div className="etis-cat-skeleton__crumbs" />

      <div className="etis-cat-skeleton__heading" />
      <div className="etis-cat-skeleton__line" />

      <div className="etis-brands__grid" style={{ marginTop: 32 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="etis-brands__skeleton" />
        ))}
      </div>
    </div>
  );
}
