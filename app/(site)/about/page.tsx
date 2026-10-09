import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BRAND } from '@/lib/config';
import { GLOSSARY, MISSION, PROMISE_TEXT, STORY_INTRO, STORY_TIMELINE, VISION } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About us',
  description:
    'About Heritage Bites: a culturally inspired African restaurant and takeaway in Pretoria Central. Our story, vision, mission and how we started.',
  alternates: { canonical: '/about' },
};

const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`;

export default function AboutPage() {
  return (
    <>
      <section className="grain relative overflow-hidden bg-navy text-cream">
        <div aria-hidden="true" className="kasi-panel" />
        <div className="container-hb grid items-center gap-14 pb-28 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-32 lg:pt-20">
          <div className="max-w-2xl">
            <p className="kicker kicker-light">About us</p>
            <p className="eyebrow eyebrow-light mt-2">Heritage on a plate</p>
            <h1 className="mt-3 text-[clamp(2.6rem,5vw,4.4rem)] font-bold leading-[1.05] text-cream">
              Authentic heritage meals, made for modern Pretoria
            </h1>
            {STORY_INTRO.map((paragraph) => (
              <p key={paragraph} className="mt-6 text-[1.06rem] leading-[1.85] text-cream/85">
                {paragraph}
              </p>
            ))}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/menu" className="btn btn-ochre">
                See the menu
              </Link>
              <Link href="/contact" className="btn btn-ghost-light">
                Visit or contact us
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="arch aspect-[4/5] w-full overflow-hidden shadow-lift ring-1 ring-ochre-bright/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/menu/mogodu-2.webp" alt="Mogodu stew served with pap" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 left-4 rounded-3xl bg-white p-5 text-navy shadow-lift">
              <p className="font-display text-4xl font-bold">Est. 2025</p>
              <p className="mt-1 text-sm text-body">Officially established, Pretoria Central</p>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
      </section>

      <section id="vision" aria-labelledby="vision-heading" className="container-hb scroll-mt-40 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading id="vision-heading" kicker="Our vision" script="Where we are going" title="A proud everyday place for traditional food" />
          <blockquote className="card flex flex-col justify-center gap-6 p-8 md:p-10">
            <p className="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-snug text-navy">“{VISION.text}”</p>
            <p className="kicker">Vision</p>
          </blockquote>
        </div>
      </section>

      <section id="mission" aria-labelledby="mission-heading" className="scroll-mt-40 bg-white">
        <div className="container-hb py-16 md:py-24">
          <SectionHeading id="mission-heading" kicker="Our mission" script="What we do every day" title="Serving heritage, one plate at a time">
            <p>{MISSION.text}</p>
          </SectionHeading>
          <ol className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {MISSION.pillars.map((pillar, index) => (
              <li key={pillar.title} className="flex flex-col gap-4 rounded-[1.75rem] border border-navy/10 bg-cream p-7">
                <span className="font-display text-4xl font-bold italic text-ochre-deep">0{index + 1}</span>
                <h3 className="text-xl font-bold text-navy">{pillar.title}</h3>
                <p className="text-[0.95rem] leading-relaxed">{pillar.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="how-we-started" aria-labelledby="how-heading" className="container-hb scroll-mt-40 py-16 md:py-24">
        <SectionHeading id="how-heading" kicker="How we started" script="From family kitchens to Sisulu Street" title="The story so far" />
        <ol className="relative mt-16 grid gap-10 border-l-2 border-ochre/40 pl-8 md:ml-4 md:pl-12">
          {STORY_TIMELINE.map((step) => (
            <li key={step.title} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[2.62rem] top-0 flex h-5 w-5 items-center justify-center rounded-full border-4 border-cream bg-ochre md:-left-[3.62rem]"
              />
              <p className="kicker">{step.label}</p>
              <h3 className="mt-2 text-2xl font-bold text-navy">{step.title}</h3>
              <p className="mt-3 max-w-2xl text-[1.02rem] leading-[1.8]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="promise-heading" className="grain relative overflow-hidden bg-navy py-24 text-cream">
        <div className="container-hb grid gap-12 lg:grid-cols-2">
          <div>
            <p className="kicker kicker-light">Every bite tells a story</p>
            <p className="eyebrow eyebrow-light mt-2">Our promise</p>
            <h2 id="promise-heading" className="mt-3 text-[clamp(2rem,3.6vw,3rem)] font-bold text-cream">
              The bridge between informal traditional food and proper dining
            </h2>
          </div>
          <p className="self-end text-[1.08rem] leading-[1.9] text-cream/85">{PROMISE_TEXT}</p>
        </div>
        <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
      </section>

      <section id="glossary" aria-labelledby="glossary-heading" className="container-hb scroll-mt-40 py-16 md:py-24">
        <SectionHeading id="glossary-heading" kicker="Heritage glossary" script="What the words mean" title="Our dishes, explained">
          <p>New to South African food? Here is what you will see on our menu.</p>
        </SectionHeading>
        <dl className="mt-14 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {GLOSSARY.map((entry) => (
            <div key={entry.term} className="border-b border-navy/10 pb-6">
              <dt className="font-display text-2xl font-bold text-navy">{entry.term}</dt>
              <dd className="mt-2 leading-relaxed">{entry.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="about-cta" className="container-hb pb-16 md:pb-24">
        <div className="card flex flex-col items-start justify-between gap-8 p-8 md:flex-row md:items-center md:p-10">
          <div>
            <p className="kicker">Come and eat with us</p>
            <h2 id="about-cta" className="mt-2 text-3xl font-bold text-navy">
              {BRAND.street}, {BRAND.suburb}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-navy">
              Order for collection
            </Link>
            <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Get directions
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
