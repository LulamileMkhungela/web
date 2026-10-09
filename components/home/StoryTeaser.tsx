import Link from 'next/link';
import { CalendarDays, MapPin, Utensils } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { STORY_INTRO } from '@/lib/content';

const FACTS = [
  { icon: Utensils, text: 'Recipes from family kitchens' },
  { icon: MapPin, text: '323 Sisulu Street, Pretoria Central' },
  { icon: CalendarDays, text: 'Weekly specials and breakfast' },
];

export function StoryTeaser() {
  return (
    <section aria-labelledby="story-heading" className="bg-white">
      <div className="container-hb grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="arch aspect-[4/5] w-full overflow-hidden shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/menu/pap-cabbage-1.webp"
              alt="Pap served with braised cabbage and carrot"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="card absolute -bottom-6 -right-2 max-w-[250px] p-5 sm:-right-6">
            <p className="font-display text-4xl font-bold text-navy">Est. 2025</p>
            <p className="mt-1 text-sm text-body">Traditional African food, takeaway and delivery in Pretoria Central.</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <SectionHeading
            id="story-heading"
            kicker="Our story"
            script="Every bite tells a story"
            title="Roots in family kitchens, served in Pretoria Central"
          >
            <p>{STORY_INTRO[0]}</p>
          </SectionHeading>
          <ul className="grid gap-4 sm:grid-cols-3">
            {FACTS.map((fact) => {
              const Icon = fact.icon;
              return (
                <li key={fact.text} className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-cream p-5">
                  <Icon className="h-5 w-5 text-ochre-deep" aria-hidden="true" />
                  <span className="text-sm font-semibold leading-snug text-navy">{fact.text}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/about" className="btn btn-navy">
              Read our story
            </Link>
            <Link href="/about#vision" className="btn btn-outline">
              Our vision
            </Link>
            <Link href="/about#mission" className="btn btn-outline">
              Our mission
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
