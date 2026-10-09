import { get, getDb } from './db';
import { getSiteSettings } from './settings';

/** Current kitchen estimate for a fresh order, based on how busy the kitchen is. */
export function kitchenEtaMinutes(): number {
  const settings = getSiteSettings();
  const active =
    get<{ n: number }>(getDb(), "SELECT COUNT(*) AS n FROM orders WHERE status IN ('new','preparing','ready')")?.n ?? 0;
  const raw = settings.prep.baseMinutes + settings.prep.perOpenOrderMinutes * active;
  return Math.min(settings.prep.maxMinutes, Math.max(5, raw));
}
