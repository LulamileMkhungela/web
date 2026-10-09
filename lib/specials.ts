import type { SpecialView } from './types';
import { sastNow, toMinutes } from './time';

/** True when a special is switched on, on its weekday and inside its time window. */
export function specialIsLiveAt(special: SpecialView, now: Date = new Date()): boolean {
  if (!special.active) return false;
  const parts = sastNow(now);
  if (special.weekday !== null && special.weekday !== parts.weekday) return false;
  if (special.windowStart && special.windowEnd) {
    if (parts.minutes < toMinutes(special.windowStart) || parts.minutes >= toMinutes(special.windowEnd)) {
      return false;
    }
  }
  return true;
}

/**
 * The specials for the home page: today's first (every-day specials and the ones for today's
 * weekday), then the next ones coming up in the week, in day order. At most `limit` are returned.
 */
export function homeSpecials(specials: SpecialView[], todayWeekday: number, limit = 3): SpecialView[] {
  return specials
    .filter((special) => special.active)
    .map((special) => ({
      special,
      daysAhead: special.weekday === null ? 0 : (special.weekday - todayWeekday + 7) % 7,
    }))
    .sort((a, b) => a.daysAhead - b.daysAhead || a.special.sort - b.special.sort)
    .slice(0, limit)
    .map(({ special }) => special);
}

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
