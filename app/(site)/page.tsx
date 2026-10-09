import { CategoryTiles } from '@/components/home/CategoryTiles';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { Hero } from '@/components/home/Hero';
import { HeritageWheel, type WheelItem } from '@/components/home/HeritageWheel';
import { SpecialsTicker } from '@/components/home/SpecialsTicker';
import { StoryTeaser } from '@/components/home/StoryTeaser';
import { TodaySpecials, type SpecialCardData } from '@/components/home/TodaySpecials';
import { VisitBlock } from '@/components/home/VisitBlock';
import { WaysToOrder } from '@/components/home/WaysToOrder';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { HERO_SLIDES } from '@/lib/content';
import { kitchenEtaMinutes } from '@/lib/kitchen';
import { listCategories, listItems, listSpecials } from '@/lib/menu';
import { formatZAR } from '@/lib/money';
import { getSiteSettings } from '@/lib/settings';
import { specialIsLiveAt } from '@/lib/specials';
import { LONG_DAYS } from '@/lib/config';
import { openStatus, sastNow, toMinutes, fromMinutes } from '@/lib/time';

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
  const categories = listCategories();
  const items = listItems();
  const itemById = new Map(items.map((i) => [i.id, i]));
  const now = new Date();
  const today = sastNow(now).weekday;

  const slides = HERO_SLIDES.map((slide) => {
    const item = itemById.get(slide.itemId);
    return {
      src: slide.src,
      alt: slide.alt,
      caption: slide.caption,
      href: `/menu#item-${slide.itemId}`,
      priceLabel: item ? `${formatZAR(item.priceCents)} · ${item.categoryName}` : '',
    };
  });

  const todaySpecials: SpecialCardData[] = listSpecials()
    .filter((s) => s.active && (s.weekday === null || s.weekday === today))
    .map((s) => ({
      ...s,
      live: specialIsLiveAt(s, now),
      windowLabel: s.windowStart && s.windowEnd ? `Served ${s.windowStart} to ${s.windowEnd} each day` : null,
      image: s.itemImage,
    }));

  const wheelItems: WheelItem[] = shuffle(items.filter((i) => i.available))
    .slice(0, 8)
    .map((i) => ({ id: i.id, name: i.name, priceCents: i.priceCents, image: i.images[0] ?? '' }));

  const ticker = items.filter((i) => i.featured).map((i) => ({ name: i.name, priceCents: i.priceCents }));
  const todayLabel = LONG_DAYS[today];
  const openLine = status.isOpen ? `Open today until ${fromMinutes(toMinutes(settings.hours[today]?.close ?? '20:00'))}` : status.detail;

  return (
    <>
      <Hero
        slides={slides}
        statusLabel={status.label}
        statusDetail={openLine}
        etaMinutes={etaMinutes}
      />
      <SpecialsTicker items={ticker} />

      <section aria-labelledby="today-heading" className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id="today-heading" kicker={`This ${todayLabel}`} script="Today on the menu" title="Weekly meals and specials">
            <p>Our weekly specials change through the week. Every price includes VAT.</p>
          </SectionHeading>
          <a href="/specials" className="btn btn-outline self-start md:self-auto">
            See the full week
          </a>
        </div>
        <div className="mt-12">
          <TodaySpecials specials={todaySpecials} todayLabel={todayLabel} />
        </div>
      </section>

      <WaysToOrder storeLinks={settings.storeLinks} contact={settings.contact} />

      <CategoryTiles categories={categories} />

      <section aria-labelledby="wheel-heading" className="relative overflow-hidden bg-cream-deep">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8">
          <HeritageWheel items={wheelItems} />
        </div>
      </section>

      <StoryTeaser />

      <EnquiryBand />

      <VisitBlock hours={settings.hours} contact={settings.contact} />
    </>
  );
}
