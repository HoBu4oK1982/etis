"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Check, Heart, Scale, ShoppingCart, X, Info, AlertCircle } from "lucide-react";
import { useToast, type ToastItem, type ToastVariant } from "@/lib/stores/toast";
import "./toast.css";

const ICONS: Record<ToastVariant, React.ReactNode> = {
  cart: <ShoppingCart size={17} strokeWidth={2.4} />,
  wishlist: <Heart size={17} fill="currentColor" strokeWidth={0} />,
  compare: <Scale size={17} strokeWidth={2.2} />,
  success: <Check size={17} strokeWidth={2.8} />,
  error: <AlertCircle size={17} strokeWidth={2.2} />,
  info: <Info size={17} strokeWidth={2.2} />,
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const dismiss = useToast((s) => s.dismiss);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1, x: 0, y: 0 });
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, x: 40, y: 8, scale: 0.92 },
      { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
    );
  }, []);

  const handleDismiss = () => {
    const el = ref.current;
    if (!el) {
      dismiss(toast.id);
      return;
    }

    gsap.to(el, {
      opacity: 0,
      x: 60,
      scale: 0.9,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => dismiss(toast.id),
    });
  };

  return (
    <div
      ref={ref}
      className="etis-toast"
      data-variant={toast.variant}
      onClick={handleDismiss}
      role="status"
      aria-live="polite"
    >
      <span className="etis-toast__icon">{ICONS[toast.variant]}</span>
      <span className="etis-toast__text">{toast.message}</span>
      <button
        type="button"
        className="etis-toast__close"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        aria-label="Закрыть"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div className="etis-toast-container" aria-label="Уведомления">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
