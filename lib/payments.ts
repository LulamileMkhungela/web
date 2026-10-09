// DEMO payments. No card is validated, charged or stored. Only the card brand
// (guessed from the first digit) and the last four digits are kept, for receipts.
// Yoco is a demo too: the Yoco option takes card details inline and records a yoco_checkouts row.
import type { DatabaseSync } from 'node:sqlite';
import { run } from './db';
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

/** Demo Yoco payments are approved as soon as the order is placed, so the checkout row is marked succeeded. */
export function markYocoCheckoutPaid(db: DatabaseSync, checkoutId: string, nowIso: string): void {
  run(db, "UPDATE yoco_checkouts SET status = 'succeeded', completed_at = ? WHERE id = ?", nowIso, checkoutId);
}
