import Link from 'next/link';
import { SearchBox } from '@/components/search/SearchBox';
import { HeroSlides, type HeroSlide } from '@/components/home/HeroSlides';

export function Hero({
  slides,
  statusLabel,
  statusDetail,
  etaMinutes,
}: {
  slides: HeroSlide[];
  statusLabel: string;
  statusDetail: string;
  etaMinutes: number;
}) {
  return (
    <section className="grain relative isolate overflow-hidden bg-navy text-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_18%,rgba(183,126,35,0.30),transparent_38%),radial-gradient(circle_at_92%_86%,rgba(16,38,77,0.95),transparent_46%)]"
      />
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-14 px-5 pb-28 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32 lg:pt-20">
        <div className="rise flex flex-col">
          <p className="eyebrow eyebrow-light text-[clamp(2.3rem,4.4vw,3.8rem)]">A Taste of Heritage, Made With Love</p>
          <h1 className="mt-5 text-[clamp(2.6rem,5.4vw,4.9rem)] font-bold leading-[1.03] text-cream">
            Traditional African food, <span className="italic text-ochre-bright">served with pride</span>.
          </h1>
          <p className="mt-6 max-w-xl text-[1.08rem] leading-[1.85] text-cream/80">
            Mogodu, tshotlo, samp, kota and magwinya, cooked fresh at our restaurant in Pretoria Central. Order for
            collection and pay by debit card, Yoco or at the counter, or choose WhatsApp, Uber Eats or Mr D.
          </p>
          <div className="mt-9 max-w-2xl">
            <SearchBox variant="hero" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-ochre">
              Order for collection
            </Link>
            <Link href="/specials" className="btn btn-ghost-light">
              This week’s specials
            </Link>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-cream/15 pt-6">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/55">Where</dt>
              <dd className="mt-1 font-semibold text-cream">Pretoria Central</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/55">Established</dt>
              <dd className="mt-1 font-semibold text-cream">2025</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/55">Right now</dt>
              <dd className="mt-1 font-semibold text-cream">{statusLabel}</dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="relative mx-auto aspect-[4/5] w-[86%]">
            <div className="arch absolute inset-0 shadow-lift ring-1 ring-ochre-bright/40">
              <HeroSlides slides={slides} />
            </div>
            <span
              aria-hidden="true"
              className="absolute -right-6 -top-6 hidden h-28 w-28 rounded-full border border-ochre-bright/40 sm:block"
            />
          </div>

          <div className="card absolute left-0 top-[6%] w-[min(230px,48%)] p-4 text-navy">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-ochre-deep">Kitchen right now</p>
            <p className="mt-1.5 font-display text-2xl font-bold">{statusLabel}</p>
            <p className="mt-1 text-sm leading-snug text-body">{statusDetail}</p>
            <p className="mt-2 text-sm font-semibold">Typical wait: about {etaMinutes} min</p>
          </div>

          <div className="absolute right-0 top-[34%] rounded-2xl bg-ochre px-4 py-3 text-navy shadow-soft">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em]">Pay your way</p>
            <p className="mt-1 text-sm font-semibold">Card · Yoco · Counter</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
    </section>
  );
}
