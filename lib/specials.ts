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

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
