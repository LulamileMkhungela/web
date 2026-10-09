import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/site/PageHeader';
import { HOW_WE_STARTED, MISSION, STORY_INTRO, VISION, WHY_CHOOSE_US } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About us',
  description:
    'About Heritage Bites: a culturally inspired African restaurant and takeaway in Pretoria Central. Our story, vision, mission and how we started.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader kicker="About us" title="Heritage Bites, Pretoria Central">
        <p>{STORY_INTRO[0]}</p>
      </PageHeader>

      <section className="container-hb grid gap-8 py-16 md:py-24 lg:grid-cols-[18rem_1fr] lg:gap-16" aria-labelledby="story-heading">
        <div>
          <p className="kicker">Our story</p>
          <h2 id="story-heading" className="mt-2 text-[clamp(2rem,4vw,2.8rem)] font-bold">
            Every bite tells a story
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed">
          {STORY_INTRO.slice(1).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section id="vision" className="bg-white py-16 md:py-24" aria-labelledby="vision-heading">
        <div className="container-hb grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div>
            <p className="kicker">Vision</p>
            <h2 id="vision-heading" className="mt-2 text-[clamp(2rem,4vw,2.8rem)] font-bold">
              Our vision
            </h2>
          </div>
          <p className="text-xl leading-relaxed text-navy">{VISION.text}</p>
        </div>
      </section>

      <section id="mission" className="container-hb py-16 md:py-24" aria-labelledby="mission-heading">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div>
            <p className="kicker">Mission</p>
            <h2 id="mission-heading" className="mt-2 text-[clamp(2rem,4vw,2.8rem)] font-bold">
              Our mission
            </h2>
          </div>
          <div>
            <p className="text-xl leading-relaxed text-navy">{MISSION.text}</p>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2">
              {MISSION.pillars.map((pillar) => (
                <li key={pillar.title} className="card p-6">
                  <h3 className="text-xl font-bold">{pillar.title}</h3>
                  <p className="mt-2 leading-relaxed">{pillar.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="how-we-started" className="bg-cream-deep py-16 md:py-24" aria-labelledby="started-heading">
        <div className="container-hb grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div>
            <p className="kicker">Est. 2025</p>
            <h2 id="started-heading" className="mt-2 text-[clamp(2rem,4vw,2.8rem)] font-bold">
              How we started
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed">
            {HOW_WE_STARTED.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="container-hb py-16 md:py-24" aria-labelledby="why-heading">
        <p className="kicker">Why choose us</p>
        <h2 id="why-heading" className="mt-2 text-[clamp(2rem,4vw,2.8rem)] font-bold">
          Why choose us
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {WHY_CHOOSE_US.map((item) => (
            <li key={item.title} className="card p-6">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-2 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-navy text-cream">
        <div className="container-hb flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-bold text-cream sm:text-3xl">Hungry? Your next meal is one tap away.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary btn-lg">
              Order now
            </Link>
            <Link href="/contact" className="btn btn-ghost-light btn-lg">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
