import { BRAND } from './config';
import { formatZAR } from './money';
import type { CartLine } from './types';

export function whatsappLink(message?: string, number: string = BRAND.whatsappNumber): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Plain-text basket summary used for WhatsApp and "copy basket" actions. */
export function basketText(lines: CartLine[]): string {
  if (!lines.length) return '';
  const rows = lines.map((line) => `${line.qty} x ${line.name} (${formatZAR(line.priceCents * line.qty)})`);
  const total = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  return [...rows, `Total (incl. VAT): ${formatZAR(total)}`].join('\n');
}
