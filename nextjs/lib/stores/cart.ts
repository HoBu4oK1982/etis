"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  product_id: number;
  title: string;
  slug: string;
  price: number;      // цена на момент добавления (валидируется на сервере при чекауте)
  thumbnail: string | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  totalQty: () => number;
  totalPrice: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty }] };
        }),

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) })),

      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.product_id === productId ? { ...i, qty: Math.max(1, qty) } : i))
            .filter((i) => i.qty > 0),
        })),

      clear: () => set({ items: [] }),

      totalQty: () => get().items.reduce((s, i) => s + i.qty, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    {
      name: "etis-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
