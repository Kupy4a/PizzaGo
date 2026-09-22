import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { findProduct } from '@/lib/menu';

// The cart keeps only ids and quantities; names and prices are looked up
// in the catalog, so switching the language never shows stale text.
interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,

      addItem: (productId) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          return {
            items: existing
              ? state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
                )
              : [...state.items, { productId, quantity: 1 }],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      closeCart: () => set({ isCartOpen: false }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'pizzago-cart',
      version: 2,
      // v1 stored whole product objects; drop it rather than migrate.
      migrate: () => ({ items: [] }),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const selectTotalPrice = (state: CartState) =>
  state.items.reduce((sum, i) => sum + (findProduct(i.productId)?.price ?? 0) * i.quantity, 0);

export const selectItemCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

// Joins cart items with localized products, skipping ids no longer in the menu.
export function withProducts(items: CartItem[], productById: Map<string, Product>) {
  return items.flatMap((item) => {
    const product = productById.get(item.productId);
    return product ? [{ product, quantity: item.quantity }] : [];
  });
}
