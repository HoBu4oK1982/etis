"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Избранное (wishlist).
 * Отдельный стор от корзины: нельзя количество, только сам факт "нравится".
 * Точно так же переживает перезагрузку через localStorage.
 */

export type WishlistItem = {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  brand: string | null;
};

type WishlistState = {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (productId: number) => void;
  toggle: (item: WishlistItem) => void;
  has: (productId: number) => boolean;
  clear: () => void;
  count: () => number;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) =>
        set((state) =>
          state.items.some((i) => i.id === item.id)
            ? state
            : { items: [...state.items, item] }
        ),

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),

      toggle: (item) => {
        const state = get();
        if (state.items.some((i) => i.id === item.id)) state.remove(item.id);
        else state.add(item);
      },

      has: (productId) => get().items.some((i) => i.id === productId),

      clear: () => set({ items: [] }),

      count: () => get().items.length,
    }),
    {
      name: "etis-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
