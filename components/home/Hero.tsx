import Link from 'next/link';
import { formatZAR } from '@/lib/money';

export type HeroFeature = {
  name: string;
  categoryName: string;
  priceCents: number;
  image: string;
  href: string;
};

export function Hero({
  isOpen,
  statusLine,
  feature,
}: {
  isOpen: boolean;
  statusLine: string;
  feature: HeroFeature;
}) {
  return (
    <section className="grain relative overflow-hidden bg-navy text-cream">
      <div className="container-hb grid items-center gap-12 pb-20 pt-12 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28 lg:pt-20">
        <div className="max-w-2xl">
          <p className="eyebrow eyebrow-light">A Taste of Heritage, Made With Love</p>
          <h1 className="mt-4 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] text-cream">
            Traditional African food, <em className="font-display italic text-ochre-bright">served with pride.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/85">
            Mogodu, tshotlo, samp and beans, kota, magwinya and more, cooked fresh in Pretoria Central. Order for
            collection, or for delivery on Uber Eats or Mr D.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary btn-lg">
              Order now
            </Link>
            <Link href="/specials" className="btn btn-ghost-light btn-lg">
              This week’s specials
            </Link>
          </div>
          <p className="pill mt-8">
            <span className={`dot-status ${isOpen ? '' : 'dot-status-closed'}`} aria-hidden="true" />
            {statusLine}
          </p>
        </div>

        <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="arch aspect-[4/5] overflow-hidden bg-navy-soft">
            {feature.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={feature.image}
                alt={`${feature.name} served at Heritage Bites`}
                className="h-full w-full object-cover"
                width={800}
                height={1000}
                fetchPriority="high"
              />
            ) : null}
          </div>
          <figcaption className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-2xl bg-cream p-4 text-navy shadow-lift sm:inset-x-6 sm:bottom-6 sm:p-5">
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ochre-deep">{feature.categoryName}</span>
              <span className="block truncate font-display text-xl font-bold">{feature.name}</span>
              <span className="block text-sm">{formatZAR(feature.priceCents)} incl. VAT</span>
            </span>
            <Link href={feature.href} className="btn btn-navy btn-sm shrink-0">
              View dish
            </Link>
          </figcaption>
        </figure>
      </div>
      <div aria-hidden="true" className="band-stripe" />
    </section>
  );
}
