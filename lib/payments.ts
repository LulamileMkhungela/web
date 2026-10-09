// DEMO payments. No card is validated, charged or stored. Only the card brand
// (guessed from the first digit) and the last four digits are kept, for receipts.
// Yoco is simulated with a Yoco-style hosted checkout session (see /pay/yoco/[id]).
import type { DatabaseSync } from 'node:sqlite';
import { all, get, getDb, run } from './db';
import { newCheckoutId, newRef } from './ids';

export type DemoCardInput = { number?: string; name?: string; expiry?: string; cvc?: string };

function detectBrand(digits: string): string {
  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  return 'Card';
}

/** Accepts any card details (demo). Never keeps the number, expiry or CVC. */
export function processDummyCard(card?: DemoCardInput): { brand: string; last4: string; ref: string } {
  const digits = (card?.number ?? '').replace(/\D/g, '');
  return {
    brand: detectBrand(digits),
    last4: digits.slice(-4),
    ref: newRef('DEMO'),
  };
}

export function insertYocoCheckout(db: DatabaseSync, orderId: string, amountCents: number, nowIso: string): string {
  const id = newCheckoutId();
  run(
    db,
    'INSERT INTO yoco_checkouts (id, order_id, amount_cents, status, created_at) VALUES (?, ?, ?, ?, ?)',
    id,
    orderId,
    amountCents,
    'pending',
    nowIso,
  );
  return id;
}

export type YocoCheckoutView = {
  id: string;
  status: string;
  amountCents: number;
  orderNumber: number;
  orderToken: string;
  customerName: string;
  itemSummary: string[];
};

export function getYocoCheckout(id: string): YocoCheckoutView | undefined {
  const db = getDb();
  const row = get<{
    id: string;
    status: string;
    amount_cents: number;
    number: number;
    token: string;
    customer_name: string;
  }>(
    db,
    `SELECT y.id, y.status, y.amount_cents, o.number, o.token, o.customer_name
     FROM yoco_checkouts y JOIN orders o ON o.id = y.order_id WHERE y.id = ?`,
    id,
  );
  if (!row) return undefined;
  const lines = all<{ name: string; qty: number }>(
    db,
    'SELECT oi.name, oi.qty FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.token = ?',
    row.token,
  );
  return {
    id: row.id,
    status: row.status,
    amountCents: row.amount_cents,
    orderNumber: row.number,
    orderToken: row.token,
    customerName: row.customer_name,
    itemSummary: lines.map((l) => `${l.qty} x ${l.name}`),
  };
}

