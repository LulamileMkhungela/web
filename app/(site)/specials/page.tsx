import type { Metadata } from 'next';
import { SpecialCard, type SpecialCardData } from '@/components/home/TodaySpecials';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { listSpecials } from '@/lib/menu';
import { LONG_DAYS, SHORT_DAYS } from '@/lib/config';
import { formatSASTDate, sastNow } from '@/lib/time';
import { specialIsLiveAt, WEEKDAY_ORDER } from '@/lib/specials';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'This Week’s Specials',
  description:
    'Heritage Bites weekly specials: Mogodu Monday, Trotter Tuesday, Wing Wednesday, Kota Thursday, Braai Friday and more, plus our daily Breakfast Hour.',
  alternates: { canonical: '/specials' },
};

export default function SpecialsPage() {
  const now = new Date();
  const today = sastNow(now);
  const specials = listSpecials().filter((s) => s.active);
  const everyDay = specials.filter((s) => s.weekday === null);

  const toCard = (s: (typeof specials)[number]): SpecialCardData => ({
    ...s,
    live: specialIsLiveAt(s, now),
    windowLabel: s.windowStart && s.windowEnd ? `Served ${s.windowStart} to ${s.windowEnd} each day` : null,
    image: s.itemImage,
  });

  const days = WEEKDAY_ORDER.map((weekday) => {
    const offset = (weekday - today.weekday + 7) % 7;
    return {
      weekday,
      isToday: weekday === today.weekday,
      label: LONG_DAYS[weekday],
      short: SHORT_DAYS[weekday],
      date: formatSASTDate(new Date(now.getTime() + offset * 86400000)),
      specials: specials.filter((s) => s.weekday === weekday).map(toCard),
    };
  });

  return (
    <>
      <section className="grain relative overflow-hidden bg-navy text-cream">
        <div className="mx-auto w-full max-w-[1240px] px-5 pb-16 pt-16 sm:px-8">
          <p className="kicker kicker-light">Weekly planner</p>
          <p className="eyebrow eyebrow-light mt-2">Something new every day</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.6rem,5vw,4.4rem)] font-bold text-cream">This week at Heritage Bites</h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-[1.8] text-cream/80">
            Each day has its own special, from Mogodu Monday to Braai Friday. Specials with a time window are only
            available inside that window, and the Live now tag shows what is on right now. Specials are added to your
            basket at the special price.
          </p>
        </div>
        <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
      </section>

      <section aria-labelledby="every-day" className="mx-auto w-full max-w-[1240px] px-5 pt-20 sm:px-8">
        <SectionHeading id="every-day" kicker="Every day" script="Always on" title="Daily specials">
          <p>These run every day. Time-limited specials are shown with their serving window.</p>
        </SectionHeading>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {everyDay.map((s) => (
            <SpecialCard key={s.id} special={toCard(s)} />
          ))}
        </div>
      </section>

      <section aria-labelledby="planner" className="mx-auto w-full max-w-[1240px] px-5 py-20 sm:px-8">
        <SectionHeading id="planner" kicker="Monday to Sunday" script="Plan your week" title="The weekly planner" />
        <ol className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {days.map((day) => (
            <li
              key={day.weekday}
              className={`flex flex-col gap-4 rounded-[1.75rem] border p-6 ${
                day.isToday ? 'border-ochre bg-white shadow-lift ring-4 ring-ochre/15' : 'border-navy/10 bg-white/70'
              }`}
              aria-label={`${day.label}${day.isToday ? ', today' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-bold text-navy">{day.label}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{day.date}</p>
                </div>
                {day.isToday ? (
                  <span className="rounded-full bg-ochre px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">Today</span>
                ) : null}
              </div>
              {day.specials.length === 0 ? (
                <p className="text-sm text-muted">No weekday special. Browse the full menu.</p>
              ) : (
                day.specials.map((s) => (
                  <div key={s.id} className="rounded-2xl bg-cream p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-ochre-deep">{s.title}</p>
                    <p className="mt-1 font-semibold text-navy">{s.itemName}</p>
                    <p className="mt-1 text-sm">{s.description}</p>
                    <p className="mt-2 font-display text-xl font-bold text-navy">
                      R{(s.priceCents / 100).toLocaleString('en-ZA', { maximumFractionDigits: 2 })}
                    </p>
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
    </>
  );
}
