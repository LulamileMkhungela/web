import { VAT_RATE } from './config';

/**
 * Formats an amount in cents as South African rand, e.g. 8500 -> "R85", 8550 -> "R85.50".
 * Formatting is done by hand so server and browser always print the same text.
 */
export function formatZAR(cents: number, forceDecimals = false): string {
  const negative = cents < 0;
  const absolute = Math.abs(Math.round(cents));
  const rands = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  const grouped = String(rands).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  const decimals = forceDecimals || remainder !== 0;
  return `${negative ? '-' : ''}R${grouped}${decimals ? `.${String(remainder).padStart(2, '0')}` : ''}`;
}

/** The VAT portion contained in a VAT-inclusive total. */
export function vatInclusive(totalCents: number): number {
  return Math.round((totalCents * VAT_RATE) / (1 + VAT_RATE));
}
