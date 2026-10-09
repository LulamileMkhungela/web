import { AddToCartButton } from '@/components/cart/CartButtons';
import { LONG_DAYS } from '@/lib/config';
import { formatZAR } from '@/lib/money';
import { specialIsLiveAt } from '@/lib/specials';
import { sastNow } from '@/lib/time';
import type { SpecialView } from '@/lib/types';

export type SpecialCardData = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  regularPriceCents: number;
  itemName: string;
  image: string;
  live: boolean;
  dayLabel: string;
  windowLabel: string | null;
  whenLabel: string;
  buttonLabel: string;
};

/** What a special card shows: its photo, its day and time, and the label of its button. */
export function specialCardData(special: SpecialView, now: Date): SpecialCardData {
  const today = sastNow(now).weekday;
  const live = specialIsLiveAt(special, now) && special.available;
  const onDay = special.weekday === null ? null : LONG_DAYS[special.weekday];
  // A special for another weekday is shown ahead of time. Its button says which day it is on.
  const comingDay = special.weekday !== null && special.weekday !== today ? onDay : null;
  const hours = special.windowStart && special.windowEnd ? `served ${special.windowStart} to ${special.windowEnd}` : null;
  const windowLabel = hours ? `${hours.charAt(0).toUpperCase()}${hours.slice(1)}` : null;
  let whenLabel = 'Available every day';
  if (onDay && hours) whenLabel = `On ${onDay}s, ${hours}`;
  else if (onDay) whenLabel = `On ${onDay}s`;
  else if (windowLabel) whenLabel = windowLabel;
  return {
    id: special.id,
    title: special.title,
    description: special.description,
    priceCents: special.priceCents,
    regularPriceCents: special.regularPriceCents,
    itemName: special.itemName,
    image: special.itemImage,
    live,
    dayLabel: onDay ? `${onDay}s` : 'Every day',
    windowLabel,
    whenLabel,
    buttonLabel: live ? 'Add to cart' : comingDay && special.available ? `Only on ${comingDay}s` : 'Not available right now',
  };
}

export function SpecialCard({ special }: { special: SpecialCardData }) {
  const saving = special.regularPriceCents > special.priceCents;
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      {/* A fixed-height frame. Every photo fills it, so all the special cards share one image height. */}
      <div className="relative h-64 overflow-hidden bg-cream-deep">
        {special.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={special.image} alt={special.itemName} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : null}
        <span className="absolute left-4 top-4 rounded-full bg-navy px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream">
          {special.dayLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold leading-snug">{special.title}</h3>
          <p className="shrink-0 text-right">
            <span className="block text-xl font-bold text-navy">{formatZAR(special.priceCents)}</span>
            {saving ? <span className="block text-sm line-through">{formatZAR(special.regularPriceCents)}</span> : null}
          </p>
        </div>
        <p className="leading-relaxed">{special.description}</p>
        <p className="text-sm font-semibold text-ochre-deep">{special.whenLabel}</p>
        <div className="mt-auto pt-2">
          <AddToCartButton
            item={{
              lineKey: `special:${special.id}`,
              name: special.title,
              priceCents: special.priceCents,
              image: special.image,
            }}
            disabled={!special.live}
            label={special.buttonLabel}
          />
        </div>
      </div>
    </article>
  );
}

export function SpecialsGrid({ specials }: { specials: SpecialCardData[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {specials.map((special) => (
        <SpecialCard key={special.id} special={special} />
      ))}
    </div>
  );
}
