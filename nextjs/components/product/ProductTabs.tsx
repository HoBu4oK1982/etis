"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import gsap from "gsap";
import { FileText } from "lucide-react";
import type { Product } from "@/lib/types/product";
import { normalizeRichTextHtml } from "@/lib/utils/image";

type Tab = "description" | "specs" | "docs";

const TABS: { key: Tab; label: string }[] = [
  { key: "description", label: "Описание" },
  { key: "specs", label: "Характеристики" },
  { key: "docs", label: "Документы" },
];

export function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<Tab>("description");
  const normalizedDescription = normalizeRichTextHtml(product.description);

  const rootRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeRef = useRef<Tab>("description");
  const isSwitching = useRef(false);

  const isReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const moveIndicatorTo = (tab: Tab, animate = true) => {
    const tabIndex = TABS.findIndex((item) => item.key === tab);
    const button = buttonRefs.current[tabIndex];
    const indicator = indicatorRef.current;

    if (!button || !indicator) return;

    const target = {
      x: button.offsetLeft,
      width: button.offsetWidth,
    };

    gsap.killTweensOf(indicator);

    if (!animate || isReducedMotion()) {
      gsap.set(indicator, {
        ...target,
        opacity: 1,
        force3D: true,
      });
      return;
    }

    gsap.to(indicator, {
      ...target,
      opacity: 1,
      duration: 0.52,
      ease: "power4.inOut",
      force3D: true,
      overwrite: "auto",
    });
  };

  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    const indicator = indicatorRef.current;

    if (!tabs || !indicator) return;

    moveIndicatorTo("description", false);

    const observer = new ResizeObserver(() => {
      moveIndicatorTo(activeRef.current, false);
    });

    observer.observe(tabs);
    buttonRefs.current.forEach((button) => {
      if (button) observer.observe(button);
    });

    return () => {
      observer.disconnect();
      gsap.killTweensOf([indicator, panelRef.current]);
    };
  }, []);

  const centerActiveTab = (tab: Tab) => {
    const tabIndex = TABS.findIndex((item) => item.key === tab);
    const button = buttonRefs.current[tabIndex];
    const tabs = tabsRef.current;

    if (!button || !tabs || tabs.scrollWidth <= tabs.clientWidth) return;

    const targetLeft = Math.max(
      0,
      button.offsetLeft - (tabs.clientWidth - button.offsetWidth) / 2,
    );

    tabs.scrollTo({
      left: targetLeft,
      behavior: isReducedMotion() ? "auto" : "smooth",
    });
  };

  const commitTab = (next: Tab) => {
    activeRef.current = next;
    setActive(next);
  };

  const changeTab = (next: Tab) => {
    if (next === activeRef.current || isSwitching.current) return;

    const panel = panelRef.current;

    // Подчёркивание начинает физически ехать сразу после нажатия,
    // не дожидаясь смены содержимого вкладки.
    moveIndicatorTo(next, true);
    centerActiveTab(next);

    if (!panel || isReducedMotion()) {
      commitTab(next);
      return;
    }

    isSwitching.current = true;
    gsap.killTweensOf(panel);

    gsap.to(panel, {
      opacity: 0,
      y: -8,
      filter: "blur(4px)",
      duration: 0.17,
      ease: "power2.in",
      onComplete: () => {
        commitTab(next);

        requestAnimationFrame(() => {
          gsap.fromTo(
            panel,
            {
              opacity: 0,
              y: 14,
              filter: "blur(5px)",
            },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.42,
              ease: "power3.out",
              clearProps: "filter,transform,opacity",
              onComplete: () => {
                isSwitching.current = false;
              },
            },
          );
        });
      },
    });
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = TABS.findIndex(
      (tab) => tab.key === activeRef.current,
    );
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % TABS.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = TABS.length - 1;
    else return;

    event.preventDefault();
    const nextTab = TABS[nextIndex];
    changeTab(nextTab.key);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className="etis-tabs-card bg-white border border-slate-200 rounded-2xl p-6"
    >
      <div
        ref={tabsRef}
        className="etis-tabs"
        role="tablist"
        aria-label="Информация о товаре"
      >
        <span
          ref={indicatorRef}
          className="etis-tabs__indicator"
          aria-hidden="true"
        />

        {TABS.map((tab, index) => (
          <button
            key={tab.key}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            id={`product-tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            aria-controls={`product-panel-${tab.key}`}
            tabIndex={active === tab.key ? 0 : -1}
            className="etis-tab"
            data-active={active === tab.key ? "true" : "false"}
            onClick={() => changeTab(tab.key)}
            onKeyDown={handleTabKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        ref={panelRef}
        id={`product-panel-${active}`}
        className="etis-tabs__panel"
        role="tabpanel"
        aria-labelledby={`product-tab-${active}`}
        tabIndex={0}
      >
        {active === "description" && (
          <div className="prose product-description max-w-none text-slate-700 text-sm leading-relaxed" data-rich-text>
            {normalizedDescription ? (
              <div dangerouslySetInnerHTML={{ __html: normalizedDescription }} />
            ) : (
              <p className="text-slate-500">Описание пока не добавлено.</p>
            )}
          </div>
        )}

        {active === "specs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
            {product.attributes.length ? (
              product.attributes.map((attribute) => (
                <div
                  key={attribute.id}
                  className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0"
                >
                  <span className="text-slate-500 text-sm">{attribute.name}</span>
                  <span className="text-slate-900 text-sm font-medium text-right">
                    {attribute.value}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm col-span-2">
                Характеристики пока не заполнены.
              </p>
            )}
          </div>
        )}

        {active === "docs" && (
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <FileText size={18} />
            Документы будут доступны в ближайшее время.
          </div>
        )}
      </div>
    </div>
  );
}
