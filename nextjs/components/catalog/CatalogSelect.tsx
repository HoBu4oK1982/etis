"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import gsap from "gsap";
import { Check, ChevronDown } from "lucide-react";
import styles from "./CatalogSelect.module.css";

type CatalogSelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  options: CatalogSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
};

export function CatalogSelect({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
}: Props) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");

  const selectedIndex = useMemo(() => {
    const index = options.findIndex((option) => option.value === value);
    return index >= 0 ? index : 0;
  }, [options, value]);

  const selected = options[selectedIndex] ?? options[0];

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleResize = () => setOpen(false);

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    const root = rootRef.current;
    const menu = menuRef.current;
    if (!root || !menu) return;

    const rect = root.getBoundingClientRect();
    const estimatedHeight = Math.min(options.length * 48 + 18, 260);
    const shouldOpenUp =
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
    setPlacement(shouldOpenUp ? "top" : "bottom");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const items = optionRefs.current.filter(Boolean);
    const context = gsap.context(() => {
      gsap.fromTo(
        menu,
        {
          y: shouldOpenUp ? 8 : -8,
          scale: 0.97,
          autoAlpha: 0,
          transformOrigin: shouldOpenUp ? "bottom center" : "top center",
        },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.23,
          ease: "power3.out",
        },
      );
      gsap.fromTo(
        items,
        { x: -7, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.2,
          stagger: 0.025,
          ease: "power2.out",
          delay: 0.04,
        },
      );
    }, root);

    window.requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus());
    return () => context.revert();
  }, [open, options.length, selectedIndex]);

  const selectOption = (index: number) => {
    const next = options[index];
    if (!next) return;
    onChange(next.value);
    setOpen(false);
    window.requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLButtonElement>("[data-select-trigger]")?.focus();
    });
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(selectedIndex);
      setOpen(true);
    }
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>("[data-select-trigger]")?.focus();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next = (activeIndex + direction + options.length) % options.length;
      setActiveIndex(next);
      window.requestAnimationFrame(() => optionRefs.current[next]?.focus());
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : options.length - 1;
      setActiveIndex(next);
      window.requestAnimationFrame(() => optionRefs.current[next]?.focus());
    }
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${open ? styles.open : ""} ${className}`}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        data-select-trigger
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={styles.value}>{selected?.label}</span>
        <span className={styles.chevron} aria-hidden>
          <ChevronDown size={16} strokeWidth={2.4} />
        </span>
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={listboxId}
          className={`${styles.menu} ${placement === "top" ? styles.menuTop : styles.menuBottom}`}
          role="listbox"
          aria-label={ariaLabel}
        >
          <span className={styles.menuGlow} aria-hidden />
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={index === activeIndex ? 0 : -1}
                className={`${styles.option} ${
                  isSelected ? styles.optionSelected : ""
                } ${index === activeIndex ? styles.optionActive : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                onKeyDown={handleOptionKeyDown}
              >
                <span>{option.label}</span>
                <Check size={16} strokeWidth={2.7} aria-hidden />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
