import type { CartLine } from './types';
import { vatInclusive } from './money';

export const CART_KEY = 'hb-cart-v1';
export const CART_EVENT = 'hb-cart-change';
export const RECENT_ORDERS_KEY = 'hb-recent-orders-v1';

function isLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === 'string' &&
    typeof v.name === 'string' &&
    typeof v.priceCents === 'number' &&
    typeof v.image === 'string' &&
    typeof v.qty === 'number' &&
    v.qty >= 1 &&
    v.qty <= 20
  );
}

export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isLine) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function cartTotals(lines: CartLine[]) {
  const totalCents = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return { totalCents, vatCents: vatInclusive(totalCents), count };
}
