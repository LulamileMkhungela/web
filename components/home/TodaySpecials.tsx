'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Plus } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { formatZAR } from '@/lib/money';
import type { SpecialView } from '@/lib/types';

export type SpecialCardData = SpecialView & { live: boolean; windowLabel: string | null; image: string };

export function SpecialCard({ special }: { special: SpecialCardData }) {
  const cart = useCart();
  const router = useRouter();
  const line = {
    key: `special:${special.id}`,
    name: `${special.title}: ${special.itemName}`,
    priceCents: special.priceCents,
    image: special.image,
  };
  const saving = special.regularPriceCents > special.priceCents ? special.regularPriceCents - special.priceCents : 0;
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative">
        {special.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={special.image} alt={special.itemName} className="aspect-[4/3] w-full object-cover" loading="lazy" />
        ) : (
          <div className="aspect-[4/3] w-full bg-navy/10" aria-hidden="true" />
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          {special.live ? (
            <span className="rounded-full bg-success px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Live now</span>
          ) : null}
          {special.weekday === null ? (
            <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold uppercase tracking-wide text-cream">Every day</span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-ochre-deep">{special.title}</p>
          <h3 className="mt-1 text-xl font-bold leading-snug text-navy">{special.itemName}</h3>
          <p className="mt-2 text-sm leading-relaxed">{special.description}</p>
        </div>
        {special.windowLabel ? (
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
            <Clock className="h-4 w-4 text-ochre-deep" aria-hidden="true" />
            {special.windowLabel}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="font-display text-2xl font-bold text-navy">{formatZAR(special.priceCents)}</p>
            {saving > 0 ? (
              <p className="text-xs text-muted">
                <span className="line-through">{formatZAR(special.regularPriceCents)}</span> · save {formatZAR(saving)}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!special.available || !special.live}
              onClick={() => cart.add(line)}
              className="btn btn-navy btn-sm"
              aria-label={`Add ${special.title} to cart`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </button>
            <button
              type="button"
              disabled={!special.available || !special.live}
              onClick={() => {
                cart.add(line);
                router.push('/checkout');
              }}
              className="btn btn-ochre btn-sm"
            >
              Order
            </button>
          </div>
        </div>
        {!special.live ? (
          <p className="text-xs text-muted">
            <Link href="/specials" className="font-semibold text-navy underline underline-offset-4">
              See when this special is on
            </Link>
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function TodaySpecials({ specials, todayLabel }: { specials: SpecialCardData[]; todayLabel: string }) {
  if (specials.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-semibold text-navy">No specials are listed for {todayLabel}.</p>
        <p className="mt-2">Browse the full menu, or check the week’s planner.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {specials.map((s) => (
        <SpecialCard key={s.id} special={s} />
      ))}
    </div>
  );
}
