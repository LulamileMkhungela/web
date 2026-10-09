import Link from 'next/link';
import { STORY_TEASER } from '@/lib/content';

export function StoryTeaser() {
  return (
    <section className="bg-cream-deep" aria-labelledby="story-heading">
      <div className="container-hb grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-cream shadow-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/menu/kota-3.webp"
            alt="A guest enjoying a kota at Heritage Bites"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="max-w-xl">
          <p className="kicker">Our story</p>
          <h2 id="story-heading" className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold">
            Rooted in family kitchens
          </h2>
          <p className="mt-5 text-lg leading-relaxed">{STORY_TEASER}</p>
          <div className="mt-8">
            <Link href="/about" className="btn btn-primary">
              Read our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
