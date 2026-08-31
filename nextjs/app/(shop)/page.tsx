import { getHome } from "@/lib/api/home";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductSection } from "@/components/home/ProductSection";
import { PopularEquipmentSection } from "@/components/home/PopularEquipmentSection";
import { OfficialPartnersSection } from "@/components/home/OfficialPartnersSection";
import { ArticleGrid } from "@/components/home/ArticleGrid";
import type { HomeData } from "@/lib/types/home";
import { WebSiteSchema } from "@/components/seo/SchemaOrg";

// ISR: раз в 5 минут перепроверяем данные
export const revalidate = 300;

export default async function HomePage() {
  let data: HomeData;

  try {
    data = await getHome();
  } catch {
    // Вёрстка главной не должна исчезать, если Laravel временно недоступен.
    // Показываем полноценный локальный демо-слайд; после запуска API данные заменятся автоматически.
    data = FALLBACK_HOME_DATA;
  }

  return (
    <>
      <WebSiteSchema />

      <HeroSlider slides={data.slides} categories={data.root_categories} />

      <PopularEquipmentSection products={data.hits} />

      <OfficialPartnersSection partners={data.partners} />

      {data.sales.length > 0 && (
        <ProductSection
          title="Акции"
          subtitle="Товары со скидками"
          href="/sales"
          products={data.sales}
          accent="rose"
        />
      )}

      {data.news.length > 0 && (
        <ProductSection
          title="Новинки"
          subtitle="Недавно поступили в продажу"
          href="/news"
          products={data.news}
        />
      )}

      {data.articles.length > 0 && <ArticleGrid articles={data.articles} />}
    </>
  );
}

const emptyMeta = { title: null, description: null, keywords: null };

const FALLBACK_HOME_DATA: HomeData = {
  slides: [
    {
      id: -1,
      eyebrow: "ОБОРУДОВАНИЕ. ИНЖИНИРИНГ. НАДЁЖНОСТЬ.",
      title: "Инженерные\nсистемы нового уровня",
      subtitle:
        "Отопление, кондиционирование, холодоснабжение и водоснабжение для объектов любой сложности.",
      link: "/shop",
      image: "/images/hero/etis-engineering-slide.png",
      position: 1,
    },
  ],
  root_categories: [
    { id: -1, title: "Отопление", subtitle: null, short_description: null, slug: "otoplenie", description: "Котлы, горелки, радиаторы, теплообменники и др.", image: null, parent_id: null, position: 1, meta: emptyMeta },
    { id: -2, title: "Холодоснабжение", subtitle: null, short_description: null, slug: "xolodosnabzenie", description: "Чиллеры, фанкойлы, компрессоры и др.", image: null, parent_id: null, position: 2, meta: emptyMeta },
    { id: -3, title: "Водоснабжение", subtitle: null, short_description: null, slug: "vodosnabzenie", description: "Насосы, трубы, запорная арматура и др.", image: null, parent_id: null, position: 3, meta: emptyMeta },
    { id: -4, title: "Услуги", subtitle: null, short_description: null, slug: "uslugi", description: "Монтаж, сервис, пусконаладка и обслуживание", image: null, parent_id: null, position: 4, meta: emptyMeta },
    { id: -5, title: "Проектирование", subtitle: null, short_description: null, slug: "proektirovanie", description: "Проектирование инженерных систем любой сложности", image: null, parent_id: null, position: 5, meta: emptyMeta },
    { id: -6, title: "Комплектующие", subtitle: null, short_description: null, slug: "komplektuyushchie", description: "Фитинги, клапаны, датчики, автоматика и др.", image: null, parent_id: null, position: 6, meta: emptyMeta },
  ],
  hits: [],
  sales: [],
  news: [],
  articles: [],
  partners: [],
};
