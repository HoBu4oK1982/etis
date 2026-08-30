import { BadgePercent, Flame, Sparkles, type LucideIcon } from "lucide-react";
import type { CatalogRemark } from "@/lib/types/catalog";
import { REMARK_META } from "@/lib/utils/remark-meta";

const ICON_BY_REMARK: Record<CatalogRemark, LucideIcon> = {
  hit: Flame,
  new: Sparkles,
  sale: BadgePercent,
};

type Props = {
  remark: CatalogRemark;
  total: number;
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
 * Шапка страниц /hits, /sales, /news.
 * Серверный компонент — все данные приходят пропсами, гидрация не нужна.
 * Акцент (иконка, полосы, счётчик) — в фирменном цвете подборки, тот же,
 * что у соответствующего бейджа на карточке товара.
 */
export function RemarkHero({ remark, total }: Props) {
  const meta = REMARK_META[remark];
  const Icon = ICON_BY_REMARK[remark];

  return (
    <section
      className="etis-remark-hero"
      style={
        {
          "--remark-from": meta.accent.from,
          "--remark-to": meta.accent.to,
          "--remark-text": meta.accent.text,
          "--remark-soft": meta.accent.soft,
        } as React.CSSProperties
      }
    >
      <div className="etis-remark-hero__icon">
        <Icon size={30} strokeWidth={1.8} />
      </div>

      <div className="etis-remark-hero__copy">
        <div className="etis-remark-hero__eyebrow">
          <span />
          {meta.eyebrow}
        </div>

        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
      </div>

      <div className="etis-remark-hero__stat">
        <b>{total.toLocaleString("ru-RU")}</b>
        <span>{plural(total, ["позиция", "позиции", "позиций"])}</span>
      </div>
    </section>
  );
}
