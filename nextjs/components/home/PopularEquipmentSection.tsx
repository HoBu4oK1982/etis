import Link from "next/link";
import {
  ClipboardCheck,
  Headphones,
  PencilRuler,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { SwipeHint } from "@/components/ui/SwipeHint";
import type { ProductListItem } from "@/lib/types/product";

const demoProducts: ProductListItem[] = [
  { id: -101, title: "Горелка Baltur TBG 120 P", slug: "gorelka-baltur-tbg-120-p", sku: null, price: 1248000, selling_price: 1248000, effective_price: 1248000, has_discount: false, remark: "hit", thumbnail: null, brand: { id: -1, title: "Baltur", slug: "baltur" }, category_id: null },
  { id: -102, title: "Настенный котел Baxi ECO 4s 24F", slug: "baxi-eco-4s-24f", sku: null, price: 780000, selling_price: 780000, effective_price: 780000, has_discount: false, remark: null, thumbnail: null, brand: { id: -2, title: "Baxi", slug: "baxi" }, category_id: null },
  { id: -103, title: "Чиллер Haier AquaSnap 30RB", slug: "haier-aquasnap-30rb", sku: null, price: 6450000, selling_price: 6450000, effective_price: 6450000, has_discount: false, remark: null, thumbnail: null, brand: { id: -3, title: "Haier", slug: "haier" }, category_id: null },
  { id: -104, title: "Насос Grundfos MAGNA3 32-100", slug: "grundfos-magna3-32-100", sku: null, price: 634000, selling_price: 634000, effective_price: 634000, has_discount: false, remark: null, thumbnail: null, brand: { id: -4, title: "Grundfos", slug: "grundfos" }, category_id: null },
  { id: -105, title: "Радиатор Royal Thermo PianoForte", slug: "royal-thermo-pianoforte", sku: null, price: 52300, selling_price: 52300, effective_price: 52300, has_discount: false, remark: null, thumbnail: null, brand: { id: -5, title: "Royal Thermo", slug: "royal-thermo" }, category_id: null },
];

/* ---------- Преимущества ---------- */

type Benefit = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const BENEFITS: Benefit[] = [
  {
    icon: ClipboardCheck,
    title: "Комплексный подход",
    text: "От проекта до сервисного обслуживания",
  },
  {
    icon: ShieldCheck,
    title: "Официальная гарантия",
    text: "Гарантия от производителя и нашей компании",
  },
  {
    icon: Truck,
    title: "Быстрая доставка",
    text: "По Алматы и всему Казахстану в кратчайшие сроки",
  },
  {
    icon: PencilRuler,
    title: "Инженерная экспертиза",
    text: "Опытные инженеры и точный подбор оборудования",
  },
  {
    icon: Headphones,
    title: "Сервис 24/7",
    text: "Техническая поддержка и выезд специалистов",
  },
];

export function PopularEquipmentSection({ products }: { products: ProductListItem[] }) {
  // Та же карточка, что в остальных секциях и в каталоге — отдельной
  // вёрстки у «Популярного оборудования» больше нет.
  const items = (products.length ? products : demoProducts).slice(0, 4);

  return (
    <section className="popular-equipment container-narrow" aria-labelledby="popular-equipment-title">
      <div className="popular-equipment-heading">
        <h2 id="popular-equipment-title">Популярное оборудование</h2>
        <Link href="/hits">Смотреть все <span>→</span></Link>
      </div>

      <div className="popular-equipment-layout">
        <div className="popular-product-grid-wrap">
          <SwipeHint className="popular-product-grid__hint" />
          <div className="popular-product-grid">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>

        <aside className="popular-promo-card">
          <div>
            <h3>Специальные<br />предложения</h3>
            <p>Выгодные цены<br />на проверенное<br />оборудование</p>
          </div>
          <div className="popular-percent">%</div>
          <Link href="/sales">Смотреть акции</Link>
        </aside>
      </div>

      <div className="popular-benefits">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div className="popular-benefit" key={title}>
            <span className="popular-benefit__icon">
              <Icon size={26} strokeWidth={1.9} />
            </span>
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
