import { HeaderTopBar } from "./HeaderTopBar";
import { HeaderMain } from "./HeaderMain";
import { HeaderNav } from "./HeaderNav";
import { StickyHeader } from "./StickyHeader";
import { getCategoryTree } from "@/lib/api/categories";
import type { CategoryTreeNode } from "@/lib/types/category";

/**
 * Основная и прилипающая шапки используют одно дерево категорий.
 * Данные загружаются на сервере один раз и передаются обоим меню.
 *
 * HeaderMain тоже получает categories: на мобилке в HeaderMain
 * рендерится компактная кнопка «Каталог», которая открывает
 * то же CatalogMegaMenu, что и десктопная нижняя полоса.
 */
export async function Header() {
  let categories: CategoryTreeNode[] = [];

  try {
    categories = await getCategoryTree();
  } catch {
    categories = [];
  }

  return (
    <>
      <header className="relative z-40">
        <HeaderTopBar />
        <HeaderMain categories={categories} />
        <HeaderNav categories={categories} />
      </header>
      <StickyHeader categories={categories} />
    </>
  );
}
