import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getTopCategories } from "@/lib/api/shop";
import { CategoryShowcase } from "@/components/catalog/CategoryShowcase";
import "@/components/catalog/catalog.css";

// ISR: 5 минут (см. REVALIDATE.catalog)
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Каталог оборудования — отопление, вентиляция, водоснабжение",
  description:
    "Каталог ETIS: котлы, насосы, радиаторы, кондиционеры, трубы и комплектующие. Официальные бренды, наличие на складе в Казахстане, подбор оборудования под объект.",
  alternates: { canonical: "/shop" },
};

function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

/**
 * /shop — верхний уровень каталога: только корневые категории.
 * Товары и фильтры живут ниже, на страницах /category/{slug}.
 */
export default async function ShopPage() {
  const categories = await getTopCategories().catch(() => []);
  const total = categories.reduce((sum, c) => sum + c.products_count, 0);

  return (
    <div className="container-narrow py-6 md:py-10">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />

      <section className="etis-cat-showcase">
        <div className="etis-cat-showcase__head">
          <div>
            <h1>Каталог оборудования</h1>
            <p>
              Отопление, вентиляция, кондиционирование и водоснабжение. Выберите
              направление — внутри разделы, бренды и подбор по параметрам.
            </p>
          </div>

          {total > 0 && (
            <span className="etis-cat-showcase__total">
              {total.toLocaleString("ru-RU")}{" "}
              {plural(total, ["позиция", "позиции", "позиций"])}
            </span>
          )}
        </div>

        <CategoryShowcase categories={categories} />
      </section>
    </div>
  );
}
