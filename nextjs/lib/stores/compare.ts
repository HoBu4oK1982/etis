"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Сравнение товаров.
 *
 * Держим самое необходимое для таблицы: id / slug / thumbnail / бренд / цена
 * плюс "снимок" характеристик в момент добавления — чтобы страница /compare
 * могла показать таблицу без похода на бэк за каждым товаром.
 *
 * Лимит — 4 товара (как в бытовых интернет-магазинах). При переполнении
 * заменяется самый старый — вместо тихого "молча не добавили".
 */

export type CompareAttribute = { name: string; value: string };

export type CompareItem = {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  brand: string | null;
  attributes: CompareAttribute[];
};

const MAX_ITEMS = 4;

type CompareState = {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (productId: number) => void;
  toggle: (item: CompareItem) => void;
  has: (productId: number) => boolean;
  clear: () => void;
  count: () => number;
};

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          const next = [...state.items, item];
          // Переполнение — выкидываем самый старый (FIFO)
          if (next.length > MAX_ITEMS) next.shift();
          return { items: next };
        }),

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),

      toggle: (item) => {
        const state = get();
        if (state.items.some((i) => i.id === item.id)) {
          state.remove(item.id);
        } else {
          state.add(item);
        }
      },

      has: (productId) => get().items.some((i) => i.id === productId),

      clear: () => set({ items: [] }),

      count: () => get().items.length,
    }),
    {
      name: "etis-compare",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
