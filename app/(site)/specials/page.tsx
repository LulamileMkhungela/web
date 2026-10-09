import type { Metadata } from 'next';
import Link from 'next/link';
import { AddToCartButton } from '@/components/cart/CartButtons';
import { SpecialsGrid, specialCardData } from '@/components/home/TodaySpecials';
import { PageHeader } from '@/components/site/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { LONG_DAYS } from '@/lib/config';
import { listSpecials } from '@/lib/menu';
import { formatZAR } from '@/lib/money';
import { WEEKDAY_ORDER } from '@/lib/specials';
import { formatSASTDate, sastNow } from '@/lib/time';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'This Week’s Specials',
  description:
    'Heritage Bites weekly specials: a different special every day of the week, plus our daily Breakfast Hour.',
  alternates: { canonical: '/specials' },
};

export default function SpecialsPage() {
  const now = new Date();
  const today = sastNow(now).weekday;
  const active = listSpecials()
    .filter((special) => special.active)
    .sort((a, b) => a.sort - b.sort);
  const everyDay = active.filter((special) => special.weekday === null).map((special) => specialCardData(special, now));

  const days = WEEKDAY_ORDER.map((weekday) => {
    const offset = (weekday - today + 7) % 7;
    return {
      weekday,
      isToday: weekday === today,
      label: LONG_DAYS[weekday],
      date: formatSASTDate(new Date(now.getTime() + offset * 86400000)),
      specials: active.filter((special) => special.weekday === weekday).map((special) => specialCardData(special, now)),
    };
  });

  return (
    <>
      <PageHeader kicker="Specials" script="Something new every day" title="This week at Heritage Bites">
        <p>
          Each day has its own special. Specials with a time window are only available inside that window, and the day
          shown is based on South African time.
        </p>
      </PageHeader>

      <section aria-labelledby="planner" className="container-hb py-16 md:py-24">
        <SectionHeading id="planner" kicker="Monday to Sunday" script="Plan your week" title="The weekly planner" />
        <ol className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {days.map((day) => (
            <li
              key={day.weekday}
              aria-label={`${day.label}${day.isToday ? ', today' : ''}`}
              className={`flex flex-col gap-4 rounded-[1.75rem] border p-6 ${
                day.isToday ? 'border-ochre bg-white shadow-lift ring-4 ring-ochre/15' : 'border-navy/10 bg-white/80'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-bold text-navy">{day.label}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{day.date}</p>
                </div>
                {day.isToday ? (
                  <span className="rounded-full bg-ochre px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
                    Today
                  </span>
                ) : null}
              </div>

              {day.specials.length === 0 ? (
                <p className="text-sm">
                  No weekday special.{' '}
                  <Link href="/menu" className="font-semibold text-navy underline underline-offset-4">
                    Browse the full menu
                  </Link>
                  .
                </p>
              ) : (
                day.specials.map((special) => (
                  <div key={special.id} className="flex flex-col gap-2 rounded-2xl bg-cream p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-ochre-deep">{special.title}</p>
                    <p className="font-semibold text-navy">{special.itemName}</p>
                    <p className="text-sm leading-relaxed">{special.description}</p>
                    {special.windowLabel ? (
                      <p className="text-xs font-semibold text-ochre-deep">{special.windowLabel}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <p className="font-display text-xl font-bold text-navy">{formatZAR(special.priceCents)}</p>
                      <AddToCartButton
                        item={{
                          lineKey: `special:${special.id}`,
                          name: special.title,
                          priceCents: special.priceCents,
                          image: special.image,
                        }}
                        disabled={!special.live}
                        label={special.live ? 'Add to cart' : day.isToday ? 'Not available now' : `Only on ${day.label}`}
                      />
                    </div>
                  </div>
                ))
              )}
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-muted">
          Special prices include VAT. The day shown above is based on South African time (SAST).
        </p>
      </section>

      {everyDay.length > 0 ? (
        <section aria-labelledby="every-day" className="container-hb pb-16 md:pb-24">
          <SectionHeading id="every-day" kicker="Every day" script="Always on" title="Daily specials">
            <p>These run every day. Time-limited specials show their serving window.</p>
          </SectionHeading>
          <div className="mt-10">
            <SpecialsGrid specials={everyDay} />
          </div>
        </section>
      ) : null}

      <section className="container-hb pb-16 md:pb-24">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-lg font-semibold text-navy">Looking for something else?</p>
            <p className="mt-1">The full menu has every dish, with the same prices all week.</p>
          </div>
          <Link href="/menu" className="btn btn-navy shrink-0">
            See the full menu
          </Link>
        </div>
      </section>
    </>
  );
}
