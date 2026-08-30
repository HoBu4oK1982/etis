import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";

/**
 * Шапка и футер намеренно вынесены за пределы PageTransition:
 * анимируется только содержимое страницы, а навигация остаётся
 * на месте — так переход читается как смена контента, а не как
 * перезагрузка всего сайта.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <PageTransition>
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
      </PageTransition>
      <Footer />
    </>
  );
}
