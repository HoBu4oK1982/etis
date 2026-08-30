import { Flame, Sparkles, BadgePercent, type LucideIcon } from "lucide-react";
import type { ProductRemark } from "@/lib/types/product";

type Size = "sm" | "md" | "lg";

/**
 * Конфиг единой цветовой схемы для трёх ремарок.
 * Меняй здесь — обновится и на карточке в списке, и на детальной странице.
 *
 * hit  — оранжевый (Flame)         🔥
 * new  — зелёный (Sparkles)         ✨
 * sale — тёмно-красный (BadgePercent) %
 */
const CFG: Record<Exclude<ProductRemark, null>, {
  label: string;
  Icon: LucideIcon;
  className: string;
}> = {
  hit: {
    label: "Хит",
    Icon: Flame,
    className:
      "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 ring-1 ring-inset ring-white/15",
  },
  new: {
    label: "Новинка",
    Icon: Sparkles,
    className:
      "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-inset ring-white/15",
  },
  sale: {
    label: "Акция",
    Icon: BadgePercent,
    className:
      "bg-gradient-to-br from-red-700 to-red-800 text-white shadow-lg shadow-red-700/30 ring-1 ring-inset ring-white/15",
  },
};

type Props = {
  remark: ProductRemark;
  size?: Size;
  /** Показать только иконку без подписи */
  iconOnly?: boolean;
  className?: string;
};

export function ProductBadge({ remark, size = "md", iconOnly, className }: Props) {
  if (!remark) return null;
  const cfg = CFG[remark];

  const sizeCls =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] gap-1 rounded-md"
      : size === "lg"
      ? "px-3.5 py-1.5 text-sm gap-2 rounded-xl"
      : "px-2.5 py-1 text-xs gap-1.5 rounded-lg";

  const iconSize = size === "sm" ? 12 : size === "lg" ? 18 : 14;

  return (
    <span
      className={`inline-flex items-center font-bold ${sizeCls} ${cfg.className} ${className ?? ""}`}
    >
      <cfg.Icon size={iconSize} strokeWidth={2.4} />
      {!iconOnly && cfg.label}
    </span>
  );
}
