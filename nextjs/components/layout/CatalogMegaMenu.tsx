"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ArrowRight, ChevronDown, ChevronRight, Headset, LayoutGrid } from "lucide-react";
import type { CategoryTreeNode } from "@/lib/types/category";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: CategoryTreeNode[];
  variant?: "default" | "sticky";
};

/**
 * Выпадающее меню каталога (мега-меню).
 *
 * Слева — корневые разделы, справа — подкатегории активного раздела
 * с третьим уровнем под каждой. Активный раздел переключается по
 * наведению, поэтому пользователь просматривает весь каталог, не кликая.
 *
 * Анимации на GSAP:
 *  - открытие: панель выезжает сверху, затемнение проявляется,
 *    пункты слева и колонки справа появляются со сдвигом (stagger);
 *  - закрытие: обратный ход, размонтирование только после onComplete —
 *    иначе панель исчезала бы мгновенно;
 *  - смена раздела: правая часть перерисовывается с лёгким сдвигом.
 */
export function CatalogMegaMenu({ open, onClose, categories, variant = "default" }: Props) {
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const rootsRef = useRef<HTMLUListElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  /* ---------- Брейкпоинт для мобильного аккордеона ---------- */
  // Ниже 900px правая колонка мега-меню превращается из грид-раскладки
  // в аккордеон (см. MegaMobileAccordion) — так удобнее листать длинные
  // списки одним пальцем, без прокрутки нескольких колонок сразу.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* ---------- Монтирование / размонтирование ---------- */

  useEffect(() => {
    if (open) {
      setMounted(true);
      setActiveId((prev) => prev ?? categories[0]?.id ?? null);
    }
  }, [open, categories]);

  /* ---------- Анимация открытия / закрытия ---------- */

  useLayoutEffect(() => {
    if (!mounted) return;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rootItems = rootsRef.current?.querySelectorAll(".etis-mega__root") ?? [];
    const columns = columnsRef.current?.querySelectorAll(".etis-mega__col") ?? [];

    const ctx = gsap.context(() => {
      if (open) {
        if (reduced) {
          gsap.set([panel, backdrop], { opacity: 1, y: 0 });
          return;
        }

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          backdrop,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 },
          0
        )
          .fromTo(
            panel,
            { opacity: 0, y: -18, transformOrigin: "50% 0%" },
            { opacity: 1, y: 0, duration: 0.42 },
            0
          )
          .fromTo(
            rootItems,
            { opacity: 0, x: -14 },
            { opacity: 1, x: 0, duration: 0.32, stagger: 0.028 },
            0.1
          )
          .fromTo(
            columns,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.36, stagger: 0.045 },
            0.14
          );
      } else {
        const tl = gsap.timeline({
          defaults: { ease: "power2.in" },
          onComplete: () => setMounted(false),
        });

        tl.to(panel, { opacity: 0, y: -12, duration: reduced ? 0 : 0.24 }, 0).to(
          backdrop,
          { opacity: 0, duration: reduced ? 0 : 0.24 },
          0
        );
      }
    }, panelRef);

    return () => ctx.revert();
  }, [open, mounted]);

  /* ---------- Смена активного раздела ---------- */

  useEffect(() => {
    if (!mounted || !open) return;
    const columns = columnsRef.current;
    if (!columns) return;

    const anim = gsap.fromTo(
      columns.querySelectorAll(".etis-mega__col"),
      { opacity: 0, x: 12 },
      { opacity: 1, x: 0, duration: 0.28, ease: "power2.out", stagger: 0.035 }
    );

    return () => {
      anim.kill();
    };
  }, [activeId, mounted, open]);

  /* ---------- Закрытие: Esc, клик вне, скролл, смена маршрута ---------- */

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const onPointer = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Клик по самой кнопке обрабатывает она сама (toggle)
      if (target.closest(".etis-nav__catalog, [data-catalog-trigger]")) return;
      if (target.closest(".etis-mega__panel")) return;
      onClose();
    };

    const onScroll = () => onClose();

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open, onClose]);

  // Переход по ссылке — меню закрываем
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!mounted) return null;

  const active =
    activeId != null
      ? categories.find((c) => c.id === activeId) ?? null
      : null;

  /*
   * Затемнение уходит порталом в <body>.
   *
   * Раньше оно рендерилось внутри <header class="relative z-40">: header
   * создаёт свой контекст наложения, и backdrop с z-index: 30 накрывал
   * соседние полосы шапки (контакты, логотип, поиск) — шапка гасла вместе
   * со страницей. В body backdrop остаётся ниже шапки, поэтому она видна
   * целиком, а замыливается только контент под ней.
   */
  const backdrop = createPortal(
    <div ref={backdropRef} className="etis-mega__backdrop" aria-hidden />,
    document.body
  );

  return (
    <>
      {backdrop}

      <div
        ref={panelRef}
        className={`etis-mega__panel${variant === "sticky" ? " etis-mega__panel--sticky" : ""}`}
        role="dialog"
        aria-label="Каталог оборудования"
      >
        <div className="container-narrow etis-mega__grid">
          {/* Левая колонка — корневые разделы */}
          <ul className="etis-mega__roots" ref={rootsRef}>
            {categories.map((cat) => {
              const hasChildren = (cat.children?.length ?? 0) > 0;
              const isOpen = activeId === cat.id;
              return (
              <li key={cat.id} className="etis-mega__rootItem">
                <Link
                  href={`/category/${cat.slug}`}
                  className={`etis-mega__root${isOpen ? " is-active" : ""}`}
                  data-has-children={hasChildren ? "true" : undefined}
                  onMouseEnter={() => setActiveId(cat.id)}
                  onFocus={() => setActiveId(cat.id)}
                >
                  <span>{cat.title}</span>
                  <ChevronRight size={16} strokeWidth={2.4} />
                </Link>

                {/* Отдельная кнопка-переключатель аккордеона.
                    Видна только на мобилке; на десктопе аккордеон
                    переключается hover'ом по самой ссылке. */}
                {hasChildren && (
                  <button
                    type="button"
                    className={`etis-mega__rootToggle${isOpen ? " is-open" : ""}`}
                    onClick={() => setActiveId(isOpen ? null : cat.id)}
                    aria-expanded={isOpen}
                    aria-label={
                      isOpen
                        ? `Свернуть подразделы «${cat.title}»`
                        : `Развернуть подразделы «${cat.title}»`
                    }
                  >
                    <ChevronRight size={17} strokeWidth={2.4} />
                  </button>
                )}
              </li>
              );
            })}

            <li>
              <Link href="/shop" className="etis-mega__root etis-mega__root--all">
                <span>
                  <LayoutGrid size={16} strokeWidth={2.3} />
                  Весь каталог
                </span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </Link>
            </li>
          </ul>

          {/* Правая часть — подкатегории активного раздела.
              На мобильном (≤900px) — аккордеон вместо грид-колонок:
              длинный плоский список плохо листается одним пальцем,
              а свёрнутые группы сразу показывают всю структуру раздела. */}
          {isMobile ? (
            <div className="etis-mega__mobileContent" key={active?.id ?? "empty"}>
              <MegaMobileAccordion active={active} />
            </div>
          ) : (
            <div className="etis-mega__content" ref={columnsRef} key={active?.id ?? "empty"}>
              {active && active.children.length > 0 ? (
                active.children.map((child) => (
                  <div className="etis-mega__col" key={child.id}>
                    <Link
                      href={`/category/${active.slug}/${child.slug}`}
                      className="etis-mega__col-title"
                    >
                      {child.title}
                    </Link>

                    {child.children.length > 0 && (
                      <ul className="etis-mega__sub">
                        {child.children.slice(0, 6).map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/category/${active.slug}/${child.slug}/${sub.slug}`}
                            >
                              {sub.title}
                            </Link>
                          </li>
                        ))}

                        {child.children.length > 6 && (
                          <li>
                            <Link
                              href={`/category/${active.slug}/${child.slug}`}
                              className="etis-mega__more"
                            >
                              Ещё {child.children.length - 6}
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <div className="etis-mega__col etis-mega__empty">
                  {active ? (
                    <>
                      <p>В разделе «{active.title}» нет подкатегорий.</p>
                      <Link href={`/category/${active.slug}`} className="etis-mega__more">
                        Перейти в раздел
                      </Link>
                    </>
                  ) : (
                    <p>Каталог пока не заполнен.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Промо-карточка */}
          <aside className="etis-mega__promo">
            <Headset size={26} strokeWidth={1.8} />
            <strong>Не нашли нужное оборудование?</strong>
            <p>Инженер подберёт аналог и рассчитает систему под ваш объект.</p>
            <Link href="/contacts">
              Получить подбор
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ---------- Мобильный аккордеон правой части ---------- */

/**
 * Список групп (2-й уровень) активного раздела в виде аккордеона.
 * Первая группа открыта по умолчанию, остальные свёрнуты — так весь
 * раздел виден на одном экране, а нужная группа раскрывается по тапу.
 *
 * key={active.id} на обёртке в CatalogMegaMenu гарантирует полный
 * ремонт при смене раздела — состояние "открыто/закрыто" каждый раз
 * стартует заново, без утечек между разными разделами.
 */
function MegaMobileAccordion({ active }: { active: CategoryTreeNode | null }) {
  if (!active) return null;

  const children = active.children ?? [];

  if (children.length === 0) {
    return (
      <div className="etis-mega__mEmpty">
        <p>В разделе «{active.title}» нет подкатегорий.</p>
        <Link href={`/category/${active.slug}`} className="etis-mega__more">
          Перейти в раздел
        </Link>
      </div>
    );
  }

  return (
    <div className="etis-mega__mAccordion">
      {children.map((child, index) => (
        <MegaAccordionGroup
          key={child.id}
          child={child}
          rootSlug={active.slug}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
}

function MegaAccordionGroup({
  child,
  rootSlug,
  defaultOpen,
}: {
  child: CategoryTreeNode;
  rootSlug: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLUListElement>(null);
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    // Первый рендер — выставляем высоту мгновенно, без анимации,
    // иначе открытая по умолчанию группа "разворачивалась" бы при
    // каждом открытии мега-меню.
    if (firstRender.current) {
      gsap.set(el, { height: open ? "auto" : 0 });
      firstRender.current = false;
      return;
    }

    gsap.to(el, {
      height: open ? "auto" : 0,
      duration: 0.36,
      ease: "power2.inOut",
      overwrite: true,
    });
  }, [open]);

  const subItems = child.children ?? [];

  return (
    <div className={`etis-mega__mGroup${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="etis-mega__mHead"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{child.title}</span>
        <ChevronDown size={17} strokeWidth={2.4} className="etis-mega__mChevron" />
      </button>

      <ul className="etis-mega__mBody" ref={bodyRef}>
        <li>
          <Link href={`/category/${rootSlug}/${child.slug}`} className="etis-mega__mAll">
            Все товары раздела
          </Link>
        </li>
        {subItems.map((sub) => (
          <li key={sub.id}>
            <Link href={`/category/${rootSlug}/${child.slug}/${sub.slug}`}>
              {sub.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
