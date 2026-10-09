import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GLOSSARY, MISSION, STORY_TIMELINE, VISION } from '@/lib/content';
import { BRAND } from '@/lib/config';

export const metadata: Metadata = {
  title: 'About Us: Our Story, Vision & Mission',
  description:
    'Heritage Bites is a culturally inspired African restaurant and takeaway in Pretoria Central, officially established in 2025. Read our vision, mission and how we started.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <section className="grain relative overflow-hidden bg-navy text-cream">
        <div className="mx-auto grid w-full max-w-[1240px] items-center gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="kicker kicker-light">About Us</p>
            <p className="eyebrow eyebrow-light mt-2">Heritage on a plate</p>
            <h1 className="mt-3 text-[clamp(2.6rem,5vw,4.4rem)] font-bold text-cream">
              Authentic heritage meals, made for modern Pretoria
            </h1>
            <p className="mt-6 max-w-2xl text-[1.06rem] leading-[1.85] text-cream/85">
              Heritage Bites is a culturally inspired African restaurant and takeaway in Pretoria Central. We serve
              authentic South African traditional meals in a clean, modern and welcoming environment.
            </p>
            <p className="mt-4 max-w-2xl text-[1.06rem] leading-[1.85] text-cream/85">
              From mogodu, tshotlo and samp to contemporary favourites and quick takeaway meals, every plate is prepared
              to bring comfort, value and true heritage to everyday customers.
            </p>
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
            <div className="arch aspect-[4/5] w-full shadow-lift ring-1 ring-ochre-bright/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/menu/mogodu-3.webp" alt="Mogodu served with pap and samp" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 left-4 rounded-3xl bg-white p-5 text-navy shadow-lift">
              <p className="font-display text-4xl font-bold">Est. 2025</p>
              <p className="mt-1 text-sm text-body">Officially established, Pretoria Central</p>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
      </section>

      <section id="vision" aria-labelledby="vision-heading" className="scroll-mt-40 mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading id="vision-heading" kicker="Our vision" script="Where we are going" title="A proud everyday place for traditional food" />
          <blockquote className="card flex flex-col justify-center gap-6 p-10">
            <p className="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-snug text-navy">“{VISION.text}”</p>
            <p className="kicker">Vision</p>
          </blockquote>
        </div>
      </section>

      <section id="mission" aria-labelledby="mission-heading" className="scroll-mt-40 bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8">
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

      <section id="how-we-started" aria-labelledby="how-heading" className="scroll-mt-40 mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8">
        <SectionHeading id="how-heading" kicker="How we started" script="From family kitchens to Sisulu Street" title="The story so far" />
        <ol className="relative mt-16 grid gap-10 border-l-2 border-ochre/40 pl-8 md:ml-4 md:pl-12">
          {STORY_TIMELINE.map((step) => (
            <li key={step.title} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[2.62rem] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-4 border-cream bg-ochre md:-left-[3.62rem]"
              />
              <p className="kicker">{step.label}</p>
              <h3 className="mt-2 text-2xl font-bold text-navy">{step.title}</h3>
              <p className="mt-3 max-w-2xl text-[1.02rem] leading-[1.8]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="values-heading" className="bg-navy py-24 text-cream">
        <div className="grain mx-auto w-full max-w-[1240px] px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="kicker kicker-light">Every bite tells a story</p>
              <p className="eyebrow eyebrow-light mt-2">Our promise</p>
              <h2 className="mt-3 text-[clamp(2rem,3.6vw,3rem)] font-bold text-cream">
                The bridge between informal traditional food and proper dining
              </h2>
            </div>
            <p className="self-end text-[1.08rem] leading-[1.9] text-cream/85">
              We bridge the gap between informal traditional food and formal restaurant dining by offering consistent
              quality, generous flavour and a proudly South African food experience. Whether you visit us for dine-in,
              collect a takeaway, or order through Mr D and Uber Eats, Heritage Bites makes traditional African food more
              convenient and accessible.
            </p>
          </div>
        </div>
      </section>

      <section id="glossary" aria-labelledby="glossary-heading" className="scroll-mt-40 mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8">
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

      <section aria-labelledby="about-cta" className="mx-auto w-full max-w-[1240px] px-5 pb-24 sm:px-8">
        <div className="card flex flex-col items-start justify-between gap-8 p-10 md:flex-row md:items-center">
          <div>
            <p className="kicker">Come and eat with us</p>
            <h2 id="about-cta" className="mt-2 text-3xl font-bold text-navy">
              {BRAND.street}, {BRAND.suburb}
            </h2>
            <p className="mt-2">Dine in, collect your takeaway, or order through our website, WhatsApp, Uber Eats or Mr D.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-navy">
              Order now
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
