'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cartTotals, CART_EVENT, readCart, writeCart } from '@/lib/cart';
import type { CartLine } from '@/lib/types';

export type AddLine = { key: string; name: string; priceCents: number; image: string; qty?: number };

type CartApi = {
  lines: CartLine[];
  count: number;
  totalCents: number;
  vatCents: number;
  ready: boolean;
  isOpen: boolean;
  add: (line: AddLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    setLines(readCart());
    setReady(true);
    const sync = () => setLines(readCart());
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  const add = useCallback((line: AddLine) => {
    const qty = Math.min(20, Math.max(1, line.qty ?? 1));
    const current = readCart();
    const existing = current.find((l) => l.key === line.key);
    const next = existing
      ? current.map((l) => (l.key === line.key ? { ...l, qty: Math.min(20, l.qty + qty) } : l))
      : [...current, { key: line.key, name: line.name, priceCents: line.priceCents, image: line.image, qty }];
    setLines(next);
    writeCart(next);
    setNotice({ id: Date.now(), text: `${line.name} added to your basket` });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    const current = readCart();
    const next = current
      .map((l) => (l.key === key ? { ...l, qty: Math.min(20, Math.max(0, qty)) } : l))
      .filter((l) => l.qty > 0);
    setLines(next);
    writeCart(next);
  }, []);

  const remove = useCallback((key: string) => {
    const next = readCart().filter((l) => l.key !== key);
    setLines(next);
    writeCart(next);
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    writeCart([]);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartApi>(() => {
    const totals = cartTotals(lines);
    return {
      lines,
      count: totals.count,
      totalCents: totals.totalCents,
      vatCents: totals.vatCents,
      ready,
      isOpen,
      add,
      setQty,
      remove,
      clear,
      open,
      close,
    };
  }, [lines, ready, isOpen, add, setQty, remove, clear, open, close]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {notice ? (
        <div
          key={notice.id}
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-cream shadow-lift"
        >
          {notice.text}
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
