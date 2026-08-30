type Props = {
  productsTotal: number;
  categoriesTotal: number;
  brandsTotal: number;
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
 * Шапка каталога. Серверный компонент — цифры приходят
 * из уже загруженных данных, без дополнительных запросов.
 */
export function CatalogHero({ productsTotal, categoriesTotal, brandsTotal }: Props) {
  return (
    <section className="etis-cat-hero">
      <div className="etis-cat-hero__eyebrow">
        <span />
        Каталог оборудования
      </div>

      <h1 className="etis-cat-hero__title">
        Отопление, вентиляция, водоснабжение — всё в одном каталоге
      </h1>

      <p className="etis-cat-hero__text">
        Котлы, насосы, радиаторы, кондиционеры и комплектующие от официальных
        поставщиков. Подберём оборудование под ваш объект и рассчитаем систему
        под ключ.
      </p>

      <div className="etis-cat-hero__stats">
        <div className="etis-cat-hero__stat">
          <b>{productsTotal.toLocaleString("ru-RU")}</b>
          <span>{plural(productsTotal, ["позиция", "позиции", "позиций"])} в наличии</span>
        </div>
        <div className="etis-cat-hero__stat">
          <b>{categoriesTotal}</b>
          <span>{plural(categoriesTotal, ["направление", "направления", "направлений"])}</span>
        </div>
        <div className="etis-cat-hero__stat">
          <b>{brandsTotal}</b>
          <span>{plural(brandsTotal, ["бренд", "бренда", "брендов"])}</span>
        </div>
      </div>
    </section>
  );
}
