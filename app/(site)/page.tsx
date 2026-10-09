import Link from 'next/link';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { Hero } from '@/components/home/Hero';
import { HeritageWheel, type WheelItem } from '@/components/home/HeritageWheel';
import type { HeroSlide } from '@/components/home/HeroSlides';
import { SpecialsTicker } from '@/components/home/SpecialsTicker';
import { SpecialsGrid, specialCardData } from '@/components/home/TodaySpecials';
import { StoryTeaser } from '@/components/home/StoryTeaser';
import { VisitBlock } from '@/components/home/VisitBlock';
import { WaysToOrder } from '@/components/home/WaysToOrder';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { LONG_DAYS } from '@/lib/config';
import { HERO_SLIDES } from '@/lib/content';
import { kitchenEtaMinutes } from '@/lib/kitchen';
import { listCategories, listItems, listSpecials } from '@/lib/menu';
import { formatZAR } from '@/lib/money';
import { getSiteSettings } from '@/lib/settings';
import { openStatus, sastNow } from '@/lib/time';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Traditional African Restaurant & Takeaway in Pretoria Central',
  description:
    'Order traditional African food online from Heritage Bites in Pretoria Central: mogodu, tshotlo, samp and beans, kota, magwinya and more. Pay by card, Yoco or at the counter, or order on WhatsApp, Uber Eats or Mr D.',
  alternates: { canonical: '/' },
};

function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function HomePage() {
  const settings = getSiteSettings();
  const status = openStatus(settings.hours);
  const etaMinutes = kitchenEtaMinutes();
  const now = new Date();
  const today = sastNow(now).weekday;
  const categories = listCategories();
  const items = listItems();
  const itemById = new Map(items.map((item) => [item.id, item]));

  const slides: HeroSlide[] = HERO_SLIDES.flatMap((slide) => {
    const item = itemById.get(slide.itemId);
    if (!item) return [];
    return [
      {
        src: slide.src,
        alt: slide.alt,
        caption: item.name,
        href: `/menu#item-${item.id}`,
        priceLabel: `${formatZAR(item.priceCents)} · ${item.categoryName}`,
      },
    ];
  });

  const todaySpecials = listSpecials()
    .filter((special) => special.active && (special.weekday === null || special.weekday === today))
    .map((special) => specialCardData(special, now));

  const wheelItems: WheelItem[] = shuffle(items.filter((item) => item.available))
    .slice(0, 8)
    .map((item) => ({ id: item.id, name: item.name, priceCents: item.priceCents, image: item.images[0] ?? '' }));

  const ticker = items.filter((item) => item.featured).map((item) => ({ name: item.name, priceCents: item.priceCents }));
  const todayLabel = LONG_DAYS[today];
  const closesToday = settings.hours[today]?.close;
  const openLine = status.isOpen && closesToday ? `Open today until ${closesToday}` : status.detail;

  return (
    <>
      <Hero slides={slides} statusLabel={status.label} statusDetail={openLine} etaMinutes={etaMinutes} />
      <SpecialsTicker items={ticker} />

      <section aria-labelledby="today-heading" className="container-hb py-16 md:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id="today-heading" kicker={`This ${todayLabel}`} script="Today on the menu" title="Today’s specials">
            <p>Our weekly specials change through the week. Every price includes VAT.</p>
          </SectionHeading>
          <Link href="/specials" className="btn btn-outline self-start md:self-auto">
            See the full week
          </Link>
        </div>
        <div className="mt-12">
          {todaySpecials.length > 0 ? (
            <SpecialsGrid specials={todaySpecials} />
          ) : (
            <p>
              No specials today.{' '}
              <Link href="/specials" className="font-semibold text-navy underline underline-offset-4">
                See this week’s specials
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <WaysToOrder storeLinks={settings.storeLinks} contact={settings.contact} />

      <CategoryTiles categories={categories} />

      <section aria-labelledby="wheel-heading" className="overflow-hidden bg-cream-deep">
        <div className="container-hb py-16 md:py-24">
          <HeritageWheel items={wheelItems} />
        </div>
      </section>

      <StoryTeaser />

      <EnquiryBand />

      <VisitBlock hours={settings.hours} contact={settings.contact} />
    </>
  );
}
