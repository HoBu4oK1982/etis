import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BrandsExplorer } from "@/components/brands/BrandsExplorer";
import { EMPTY_BRANDS_RESPONSE, getBrands } from "@/lib/api/brands";
import "@/components/catalog/catalog.css";
import "@/components/brands/brands.css";

// ISR: 5 минут (см. REVALIDATE.catalog)
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Бренды — официальное оборудование для отопления и водоснабжения",
  description:
    "Бренды на ETIS: Baxi, Grundfos, Wilo, Danfoss, Haier и другие производители котлов, насосов, радиаторов и климатического оборудования. Официальные поставки по Казахстану.",
  alternates: { canonical: "/brands" },
};

function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export default async function BrandsPage() {
  const response = await getBrands().catch(() => EMPTY_BRANDS_RESPONSE);
  const { data: brands, meta } = response;

  return (
    <div className="container-narrow py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Бренды" }]} />

      <section className="etis-brands-hero">
        <div className="etis-brands-hero__copy">
          <div className="etis-brands-hero__eyebrow">
            <span />
            Официальные поставки
          </div>

          <h1>Бренды инженерного оборудования</h1>

          <p>
            Работаем напрямую с производителями и авторизованными дистрибьюторами:
            гарантия завода, сервис в Казахстане и подбор оборудования под проект.
          </p>
        </div>

        <div className="etis-brands-hero__stats">
          <div>
            <b>{meta.total}</b>
            <span>{plural(meta.total, ["бренд", "бренда", "брендов"])}</span>
          </div>
          <div>
            <b>{meta.products_total.toLocaleString("ru-RU")}</b>
            <span>
              {plural(meta.products_total, ["позиция", "позиции", "позиций"])} в каталоге
            </span>
          </div>
          <div>
            <b>{meta.with_products}</b>
            <span>в наличии сейчас</span>
          </div>
        </div>
      </section>

      {brands.length === 0 ? (
        <p className="etis-cat-showcase__empty">
          Бренды пока не заполнены. Проверьте статус записей в админ-панели.
        </p>
      ) : (
        <BrandsExplorer brands={brands} />
      )}
    </div>
  );
}
