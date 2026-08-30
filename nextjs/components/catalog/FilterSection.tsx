"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

/**
 * Сворачиваемый блок фильтра. Анимация высоты — Framer Motion,
 * overflow скрывается только во время анимации, чтобы выпадающие
 * элементы внутри не обрезались в раскрытом состоянии.
 */
export function FilterSection({ title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="etis-cat-section">
      <button
        type="button"
        className="etis-cat-section__btn"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <ChevronDown size={16} strokeWidth={2.4} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="etis-cat-section__body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
