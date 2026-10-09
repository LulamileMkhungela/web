import { AddToCartButton } from '@/components/cart/CartButtons';
import { LONG_DAYS } from '@/lib/config';
import { formatZAR } from '@/lib/money';
import { specialIsLiveAt } from '@/lib/specials';
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
};

export function specialCardData(special: SpecialView, now: Date): SpecialCardData {
  return {
    id: special.id,
    title: special.title,
    description: special.description,
    priceCents: special.priceCents,
    regularPriceCents: special.regularPriceCents,
    itemName: special.itemName,
    image: special.itemImage,
    live: specialIsLiveAt(special, now) && special.available,
    dayLabel: special.weekday === null ? 'Every day' : `${LONG_DAYS[special.weekday]}s`,
    windowLabel: special.windowStart && special.windowEnd ? `Served ${special.windowStart} to ${special.windowEnd}` : null,
  };
}

export function SpecialCard({ special }: { special: SpecialCardData }) {
  const saving = special.regularPriceCents > special.priceCents;
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] bg-cream-deep">
        {special.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={special.image} alt={special.itemName} className="h-full w-full object-cover" loading="lazy" />
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
        <p className="text-sm font-semibold text-ochre-deep">
          {special.windowLabel ?? `On ${special.dayLabel.toLowerCase()}`}
        </p>
        <div className="mt-auto pt-2">
          <AddToCartButton
            item={{
              lineKey: `special:${special.id}`,
              name: special.title,
              priceCents: special.priceCents,
              image: special.image,
            }}
            disabled={!special.live}
            label={special.live ? 'Add to cart' : 'Not available right now'}
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
