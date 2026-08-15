"use client";

import { useCallback, useEffect, useState } from "react";

export type CartLine = { productId: string; quantity: number };

const CART_KEY = "lellahi_cart";

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      setLines(raw ? JSON.parse(raw) : []);
    } catch {
      setLines([]);
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
    window.dispatchEvent(new Event("lellahi-cart-change"));
  }, []);

  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      setLines((current) => {
        const existing = current.find((l) => l.productId === productId);
        const next = existing
          ? current.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l))
          : [...current, { productId, quantity }];
        try {
          localStorage.setItem(CART_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        window.dispatchEvent(new Event("lellahi-cart-change"));
        return next;
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setLines((current) => {
        const next =
          quantity <= 0
            ? current.filter((l) => l.productId !== productId)
            : current.map((l) => (l.productId === productId ? { ...l, quantity } : l));
        try {
          localStorage.setItem(CART_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        window.dispatchEvent(new Event("lellahi-cart-change"));
        return next;
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => updateQuantity(productId, 0), [updateQuantity]);

  const clearCart = useCallback(() => persist([]), [persist]);

  const totalCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return { lines, ready, addToCart, updateQuantity, removeFromCart, clearCart, totalCount };
}

/** Lightweight hook just for the navbar badge — re-reads on the custom cart-change event. */
export function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(CART_KEY);
        const lines: CartLine[] = raw ? JSON.parse(raw) : [];
        setCount(lines.reduce((sum, l) => sum + l.quantity, 0));
      } catch {
        setCount(0);
      }
    }
    read();
    window.addEventListener("lellahi-cart-change", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("lellahi-cart-change", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return count;
}
