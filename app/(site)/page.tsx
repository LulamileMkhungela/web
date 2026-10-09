import Link from 'next/link';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { Hero } from '@/components/home/Hero';
import { HowToOrder } from '@/components/home/HowToOrder';
import { SpecialsGrid, specialCardData } from '@/components/home/TodaySpecials';
import { StoryTeaser } from '@/components/home/StoryTeaser';
import { VisitBlock } from '@/components/home/VisitBlock';
import { LONG_DAYS } from '@/lib/config';
import { listCategories, listItems, listSpecials } from '@/lib/menu';
import { getSiteSettings } from '@/lib/settings';
import { openStatus, sastNow } from '@/lib/time';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Traditional African Restaurant & Takeaway in Pretoria Central',
  description:
    'Order traditional African food online from Heritage Bites in Pretoria Central: mogodu, tshotlo, samp and beans, kota, magwinya and more. Pay by card, Yoco or at the counter, or order on WhatsApp, Uber Eats or Mr D.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const settings = getSiteSettings();
  const status = openStatus(settings.hours);
  const now = new Date();
  const today = sastNow(now).weekday;
  const categories = listCategories();
  const items = listItems();
  const feature = items.find((item) => item.id === 'mogodu-samp') ?? items[0];
  const todaysSpecials = listSpecials()
    .filter((special) => special.active && (special.weekday === null || special.weekday === today))
    .map((special) => specialCardData(special, now));
  const statusLine = status.isOpen ? `Open now · ${status.detail}` : `Closed · ${status.detail}`;

  return (
    <>
      {feature ? (
        <Hero
          isOpen={status.isOpen}
          statusLine={statusLine}
          feature={{
            name: feature.name,
            categoryName: feature.categoryName,
            priceCents: feature.priceCents,
            image: feature.images[0] ?? '',
            href: `/menu#item-${feature.id}`,
          }}
        />
      ) : null}

      <section className="container-hb py-16 md:py-24" aria-labelledby="specials-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker">This {LONG_DAYS[today]}</p>
            <h2 id="specials-heading" className="mt-2 text-[clamp(2rem,4vw,3rem)] font-bold">
              Today’s specials
            </h2>
          </div>
          <Link href="/specials" className="btn btn-outline self-start sm:self-auto">
            All specials
          </Link>
        </div>
        <div className="mt-10">
          {todaysSpecials.length > 0 ? (
            <SpecialsGrid specials={todaysSpecials} />
          ) : (
            <p>No specials today. <Link href="/specials" className="font-semibold text-navy underline underline-offset-4">See this week’s specials</Link>.</p>
          )}
        </div>
      </section>

      <section className="container-hb pb-16 md:pb-24" aria-labelledby="menu-heading">
        <p className="kicker">The menu</p>
        <h2 id="menu-heading" className="mt-2 text-[clamp(2rem,4vw,3rem)] font-bold">
          Choose a category
        </h2>
        <div className="mt-10">
          <CategoryTiles categories={categories} />
        </div>
      </section>

      <section className="bg-navy text-cream" aria-labelledby="order-heading">
        <div className="container-hb py-16 md:py-24">
          <p className="kicker kicker-light">How to order</p>
          <h2 id="order-heading" className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold text-cream">
            Four ways to get your food
          </h2>
          <div className="mt-10">
            <HowToOrder storeLinks={settings.storeLinks} whatsapp={settings.contact.whatsapp} />
          </div>
        </div>
      </section>

      <StoryTeaser />
      <VisitBlock hours={settings.hours} contact={settings.contact} />
    </>
  );
}
