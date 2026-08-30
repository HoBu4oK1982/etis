"use client";

import { create } from "zustand";

export type ToastVariant = "cart" | "wishlist" | "compare" | "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  /** Автозакрытие, мс. 0 = не закрывать. По умолчанию 3000 */
  duration?: number;
};

type ToastState = {
  toasts: ToastItem[];
  show: (message: string, variant?: ToastVariant, duration?: number) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

let counter = 0;

export const useToast = create<ToastState>()((set) => ({
  toasts: [],

  show: (message, variant = "info", duration = 3000) => {
    const id = `toast-${++counter}-${Date.now()}`;
    const item: ToastItem = { id, message, variant, duration };

    set((state) => ({
      toasts: [...state.toasts.slice(-4), item],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}));
