'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ImageCarousel } from '@/components/media/ImageCarousel';

export type HeroSlide = { src: string; alt: string; caption: string; href: string; priceLabel: string };

export function HeroSlides({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];
  return (
    <div className="relative h-full w-full">
      <ImageCarousel
        images={slides.map((s) => s.src)}
        alt="Heritage Bites traditional African dishes"
        ratio="h-full"
        className="h-full"
        autoplayMs={5200}
        lightbox={false}
        priority
        onIndexChange={setIndex}
      />
      {current ? (
        <div className="absolute inset-x-4 bottom-16 z-10 flex items-center justify-between gap-3 rounded-2xl bg-cream/95 px-4 py-3 text-navy shadow-soft sm:inset-x-6">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">{current.caption}</p>
            <p className="text-xs font-semibold text-ochre-deep">{current.priceLabel}</p>
          </div>
          <Link href={current.href} className="btn btn-navy btn-sm shrink-0">
            Order
          </Link>
        </div>
      ) : null}
    </div>
  );
}
