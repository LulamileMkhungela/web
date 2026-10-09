import type { Metadata } from 'next';
import { MenuBrowser } from '@/components/menu/MenuBrowser';
import { listCategories } from '@/lib/menu';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Offering & Meals: Our Menu',
  description:
    'The full Heritage Bites menu: traditional favourites, hearty mains, popular favourites, quick takeaways, breakfast and sides. Add to cart or order in a tap.',
  alternates: { canonical: '/menu' },
};

export default function MenuPage() {
  const categories = listCategories();
  return (
    <>
      <section className="grain relative overflow-hidden bg-navy text-cream">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="kicker kicker-light">Offering / Meals</p>
            <p className="eyebrow eyebrow-light mt-2">Honest food, generous plates</p>
            <h1 className="mt-3 text-[clamp(2.6rem,5vw,4.4rem)] font-bold text-cream">Our menu</h1>
            <p className="mt-5 max-w-2xl text-[1.05rem] leading-[1.8] text-cream/80">
              Every category we serve: traditional favourites, hearty mains, popular favourites, quick takeaways,
              breakfast and sides. Add dishes to your basket, or order one straight away. Prices include VAT.
            </p>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-cream/70">
            Sold-out dishes are marked on their photo. Your basket is checked again at checkout, so you always pay the
            current price.
          </p>
        </div>
        <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
      </section>
      <MenuBrowser categories={categories} />
    </>
  );
}
