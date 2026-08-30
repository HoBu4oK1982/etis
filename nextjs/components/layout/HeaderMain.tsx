"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutGrid, Menu, Scale, Search } from "lucide-react";
import { Logo } from "./Logo";
import { SpinOnHover } from "@/components/ui/SpinOnHover";
import { HeartIcon, BagIcon, PhoneCallIcon } from "@/components/icons";
import { useCart } from "@/lib/stores/cart";
import { useCompare } from "@/lib/stores/compare";
import { useWishlist } from "@/lib/stores/wishlist";
import SmartSearch from "@/components/search/SmartSearch";
import MobileSearchOverlay from "@/components/search/MobileSearchOverlay";
import { CallbackTrigger } from "@/components/callback/CallbackTrigger";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { CatalogMegaMenu } from "./CatalogMegaMenu";
import type { CategoryTreeNode } from "@/lib/types/category";

type Props = {
  categories?: CategoryTreeNode[];
};

export function HeaderMain({ categories = [] }: Props) {
  const totalQty = useCart((s) => s.totalQty());
  const wishlistQty = useWishlist((s) => s.count());
  const compareQty = useCompare((s) => s.count());

  // mounted нужен, чтобы бэйджи не мигали 0 при hydrate:
  // zustand/persist поднимает состояние из localStorage уже после первого рендера
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Мобильные оверлеи
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  return (
    <div className="bg-[var(--header-bg)] transition-colors">
      <div className="container-narrow flex items-center gap-4 md:gap-6 lg:gap-10 h-[76px] md:h-[120px]">
        {/* Логотип — на мобилке меньше */}
        <Link href="/" className="shrink-0" aria-label="На главную">
          <span className="md:hidden"><Logo size={54} /></span>
          <span className="hidden md:inline"><Logo size={100} /></span>
        </Link>

        {/* Кнопка «Каталог» — только мобилка. Открывает мега-меню
            (то же, что на десктопе снизу шапки). */}
        <button
          type="button"
          className="etis-header__catalogBtn md:hidden"
          onClick={() => setCatalogOpen((v) => !v)}
          aria-expanded={catalogOpen}
          aria-controls="mobile-header-catalog"
          data-catalog-trigger
        >
          <LayoutGrid size={17} strokeWidth={2.2} />
          <span>Каталог</span>
        </button>

        {/* SmartSearch — только десктоп/планшет (≥768px) */}
        <div className="headerSmartSearch hidden md:block flex-1 max-w-3xl">
          <SmartSearch placeholder="Поиск по каталогу оборудования и услуг" />
        </div>

        {/* Гибкий разделитель для мобилы, чтобы кнопки ушли вправо */}
        <div className="flex-1 md:hidden" />

        {/* Иконка поиска — только мобилка */}
        <button
          type="button"
          className="etis-header__iconBtn md:hidden"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Открыть поиск"
        >
          <Search size={22} strokeWidth={2} />
        </button>

        {/* Бургер — открывает MobileNavDrawer */}
        <button
          type="button"
          className="etis-header__iconBtn md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Открыть меню"
        >
          <Menu size={24} strokeWidth={2.2} />
        </button>

        {/* Сравнение */}
        <Link
          href="/compare"
          className="hidden md:flex flex-col items-center gap-1 text-[var(--text)] hover:text-[var(--accent)] transition-colors shrink-0"
          aria-label="Сравнение"
        >
          <div className="relative">
            <SpinOnHover><Scale size={26} strokeWidth={2} /></SpinOnHover>
            {mounted && compareQty > 0 && <CountBadge value={compareQty} tone="compare" />}
          </div>
          <span className="text-[15px] font-medium">Сравнение</span>
        </Link>

        {/* Избранное */}
        <Link
          href="/favourite"
          className="hidden md:flex flex-col items-center gap-1 text-[var(--text)] hover:text-[var(--accent)] transition-colors shrink-0"
          aria-label="Избранное"
        >
          <div className="relative">
            <SpinOnHover><HeartIcon size={26} /></SpinOnHover>
            {mounted && wishlistQty > 0 && <CountBadge value={wishlistQty} tone="wishlist" />}
          </div>
          <span className="text-[15px] font-medium">Избранное</span>
        </Link>

        {/* Корзина — десктоп/планшет */}
        <Link
          href="/cart"
          className="hidden md:flex flex-col items-center gap-1 text-[var(--text)] hover:text-[var(--accent)] transition-colors shrink-0"
          aria-label="Корзина"
        >
          <div className="relative" data-cart-target>
            <SpinOnHover><BagIcon size={26} /></SpinOnHover>
            {mounted && totalQty > 0 && <CountBadge value={totalQty} tone="cart" />}
          </div>
          <span className="text-[15px] font-medium">Корзина</span>
        </Link>

        {/* Кнопка "Перезвоните мне" */}
        <CallbackTrigger
          source="main-header"
          className="hidden lg:flex items-center gap-2.5 h-12 px-6 bg-[linear-gradient(135deg,#0d70df_0%,#0756b9_52%,#073e88_100%)] text-white text-sm font-semibold rounded-xl shadow-[0_10px_24px_rgba(7,83,180,.24)] shrink-0"
          aria-label="Заказать обратный звонок"
        >
          <PhoneCallIcon size={18} />
          Перезвоните мне
        </CallbackTrigger>
      </div>

      {/* Мобильный поиск (полноэкранный оверлей) */}
      {mobileSearchOpen && (
        <MobileSearchOverlay onClose={() => setMobileSearchOpen(false)} />
      )}

      {/* Мобильное меню (правый drawer) */}
      <MobileNavDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Мега-меню каталога — выпадает из-под HeaderMain на мобилке.
          На десктопе им управляет HeaderNav, но CatalogMegaMenu спокойно
          сосуществует в двух местах: тут и там разные экземпляры. */}
      <div id="mobile-header-catalog" className="md:hidden">
        <CatalogMegaMenu
          open={catalogOpen}
          onClose={() => setCatalogOpen(false)}
          categories={categories}
        />
      </div>
    </div>
  );
}

/**
 * Счётчик на иконке. Цвет привязан к смыслу раздела:
 *   корзина — зелёный, избранное — оранжевый, сравнение — тёмно-синий.
 *
 * Цвет задаётся инлайном, а не Tailwind-классом: класс собирался бы
 * из переменной, и сканер Tailwind мог его не увидеть — бейджи так и
 * оставались синими.
 */
type BadgeTone = "cart" | "wishlist" | "compare";

const BADGE_COLORS: Record<BadgeTone, string> = {
  cart: "#1e3a8a",     // тёмно-синий (brand-900)
  wishlist: "#1e3a8a",
  compare: "#1e3a8a",
};

function CountBadge({ value, tone }: { value: number; tone: BadgeTone }) {
  return (
    <span
      className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full text-white text-[10px] font-bold grid place-items-center leading-none"
      style={{ backgroundColor: BADGE_COLORS[tone] }}
    >
      {value}
    </span>
  );
}
