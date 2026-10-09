import { SHORT_DAYS, TIMEZONE } from './config';
import type { Hours } from './types';

/** Current wall-clock parts in South Africa Standard Time (UTC+2, no DST). */
export function sastNow(date: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) map[part.type] = part.value;
  return {
    dateKey: `${map.year}-${map.month}-${map.day}`,
    weekday: SHORT_DAYS.indexOf(map.weekday as (typeof SHORT_DAYS)[number]),
    minutes: Number(map.hour) * 60 + Number(map.minute),
  };
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** A SAST wall-clock time on a given SAST date as an absolute instant. */
export function sastInstant(dateKey: string, hhmm: string): Date {
  return new Date(`${dateKey}T${hhmm}:00+02:00`);
}

export function formatSAST(value: string | Date, options: Intl.DateTimeFormatOptions = {}): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-ZA', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    ...options,
  }).format(date);
}

export function formatSASTDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-ZA', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export type OpenStatus = {
  isOpen: boolean;
  label: string;
  detail: string;
};

export function openStatus(hours: Hours, date: Date = new Date()): OpenStatus {
  const now = sastNow(date);
  const today = hours[now.weekday];
  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (now.minutes >= open && now.minutes < close) {
      return { isOpen: true, label: 'Open now', detail: `Until ${today.close} today` };
    }
    if (now.minutes < open) {
      return { isOpen: false, label: 'Closed', detail: `Opens today at ${today.open}` };
    }
  }
  for (let i = 1; i <= 7; i++) {
    const idx = (now.weekday + i) % 7;
    const next = hours[idx];
    if (next) {
      const when = i === 1 ? 'tomorrow' : SHORT_DAYS[idx];
      return { isOpen: false, label: 'Closed', detail: `Opens ${when} at ${next.open}` };
    }
  }
  return { isOpen: false, label: 'Closed', detail: 'Opening hours to be confirmed' };
}

export function isWithinHours(hours: Hours, instant: Date): boolean {
  const now = sastNow(instant);
  const day = hours[now.weekday];
  if (!day) return false;
  return now.minutes >= toMinutes(day.open) && now.minutes < toMinutes(day.close);
}

export type PickupOption = { value: string; label: string };

/**
 * Pickup choices: "asap" when open (ready around now + ETA), then 30-minute
 * slots across the next three days that respect opening hours and the ETA.
 */
export function pickupOptions(hours: Hours, etaMinutes: number, now: Date = new Date(), max = 14): PickupOption[] {
  const options: PickupOption[] = [];
  const earliest = now.getTime() + etaMinutes * 60000;
  const today = sastNow(now);
  const todayHours = hours[today.weekday];

  if (openStatus(hours, now).isOpen && todayHours) {
    const readyAt = new Date(earliest);
    const readyParts = sastNow(readyAt);
    if (readyParts.dateKey === today.dateKey && readyParts.minutes < toMinutes(todayHours.close)) {
      options.push({
        value: 'asap',
        label: `As soon as possible (ready about ${formatSAST(readyAt)})`,
      });
    }
  }

  for (let dayOffset = 0; dayOffset <= 2 && options.length < max; dayOffset++) {
    const day = new Date(now.getTime() + dayOffset * 86400000);
    const parts = sastNow(day);
    const dayHours = hours[parts.weekday];
    if (!dayHours) continue;
    const open = toMinutes(dayHours.open);
    const close = toMinutes(dayHours.close);
    for (let minute = open; minute < close && options.length < max; minute += 30) {
      const instant = sastInstant(parts.dateKey, fromMinutes(minute));
      if (instant.getTime() <= now.getTime() || instant.getTime() < earliest) continue;
      const when = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : SHORT_DAYS[parts.weekday];
      options.push({ value: instant.toISOString(), label: `${when} at ${fromMinutes(minute)}` });
    }
  }
  return options;
}
