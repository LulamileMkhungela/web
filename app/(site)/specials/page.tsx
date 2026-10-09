import type { Metadata } from 'next';
import Link from 'next/link';
import { SpecialsGrid, specialCardData } from '@/components/home/TodaySpecials';
import { PageHeader } from '@/components/site/PageHeader';
import { listSpecials } from '@/lib/menu';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Weekly specials',
  description: 'Heritage Bites weekly specials: a different special every day, plus Breakfast Hour each morning.',
  alternates: { canonical: '/specials' },
};

export default function SpecialsPage() {
  const now = new Date();
  const cards = listSpecials()
    .filter((special) => special.active)
    .sort((a, b) => a.sort - b.sort)
    .map((special) => specialCardData(special, now));

  return (
    <>
      <PageHeader kicker="Specials" title="Weekly specials">
        Each special is available on its day or during its time window. Prices include VAT.
      </PageHeader>
      <section className="container-hb py-12 md:py-16">
        {cards.length > 0 ? (
          <SpecialsGrid specials={cards} />
        ) : (
          <p>No specials are running right now. Browse the <Link href="/menu" className="font-semibold text-navy underline underline-offset-4">full menu</Link>.</p>
        )}
        <div className="mt-12 flex flex-col gap-4 rounded-3xl bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-lg font-semibold text-navy">Looking for something else?</p>
            <p className="mt-1">The full menu has every dish, with the same prices all week.</p>
          </div>
          <Link href="/menu" className="btn btn-primary shrink-0">
            See the full menu
          </Link>
        </div>
      </section>
    </>
  );
}
