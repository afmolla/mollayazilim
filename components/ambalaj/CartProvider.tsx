"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSitePrefix } from "@/components/SitePrefixProvider";
import {
  cartItemKey,
  cartStorageKey,
  cartSubtotal,
  cartTotal,
  readCartFromStorage,
  writeCartToStorage,
  type CartItem,
} from "@/lib/cart-types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (urunId: string, varyantId: string) => void;
  updateQty: (urunId: string, varyantId: string, miktar: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const sitePrefix = useSitePrefix();
  const storageKey = cartStorageKey(sitePrefix);
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setItems(readCartFromStorage(storageKey).items);
      setHydrated(true);
    });
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    writeCartToStorage(storageKey, { items });
  }, [items, storageKey, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const key = cartItemKey(item.urunId, item.varyantId);
      const idx = prev.findIndex((x) => cartItemKey(x.urunId, x.varyantId) === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], miktar: next[idx].miktar + item.miktar };
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((urunId: string, varyantId: string) => {
    const key = cartItemKey(urunId, varyantId);
    setItems((prev) => prev.filter((x) => cartItemKey(x.urunId, x.varyantId) !== key));
  }, []);

  const updateQty = useCallback((urunId: string, varyantId: string, miktar: number) => {
    const key = cartItemKey(urunId, varyantId);
    if (miktar < 1) {
      setItems((prev) => prev.filter((x) => cartItemKey(x.urunId, x.varyantId) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((x) => (cartItemKey(x.urunId, x.varyantId) === key ? { ...x, miktar } : x)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const total = useMemo(() => cartTotal(subtotal), [subtotal]);
  const count = useMemo(() => items.length, [items]);

  const value = useMemo(
    () => ({ items, count, subtotal, total, addItem, removeItem, updateQty, clear }),
    [items, count, subtotal, total, addItem, removeItem, updateQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart CartProvider içinde kullanılmalı");
  return ctx;
}

export function useCartOptional(): CartContextValue | null {
  return useContext(CartContext);
}
