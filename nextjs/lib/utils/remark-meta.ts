import type { CatalogRemark } from "@/lib/types/catalog";

/**
 * Метаданные подборок — единый источник для страниц /hits, /sales, /news
 * и заголовков на них. Иконки и цвета совпадают с ProductBadge, чтобы
 * акцент на карточках и в hero читался как одна и та же метка.
 */
export type RemarkMeta = {
  key: CatalogRemark;
  slug: "hits" | "sales" | "news";
  title: string;
  eyebrow: string;
  description: string;
  /** Название и цвет в тон бейджу товара */
  accent: {
    from: string;
    to: string;
    text: string;
    soft: string;
  };
};

export const REMARK_META: Record<CatalogRemark, RemarkMeta> = {
  hit: {
    key: "hit",
    slug: "hits",
    title: "Хиты продаж",
    eyebrow: "Выбор наших клиентов",
    description:
      "Оборудование, которое чаще всего заказывают заново. Проверенные модели с отработанной логистикой и сервисом.",
    accent: {
      from: "#f97316",
      to: "#c2410c",
      text: "#c2410c",
      soft: "#fff1e8",
    },
  },
  new: {
    key: "new",
    slug: "news",
    title: "Новинки каталога",
    eyebrow: "Только что поступило",
    description:
      "Свежие модели от производителей — только что заведены в каталог. Забирайте, пока никто не разобрал.",
    accent: {
      from: "#16a34a",
      to: "#15803d",
      text: "#15803d",
      soft: "#e8f9ef",
    },
  },
  sale: {
    key: "sale",
    slug: "sales",
    title: "Акции и скидки",
    eyebrow: "Спецпредложения",
    description:
      "Актуальные скидки на инженерное оборудование. Цены действуют, пока есть остатки на складе.",
    accent: {
      from: "#dc2626",
      to: "#991b1b",
      text: "#991b1b",
      soft: "#fee7e7",
    },
  },
};
