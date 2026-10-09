'use client';

import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { formatZAR } from '@/lib/money';

/**
 * Price ticker for featured dishes. It pauses on hover, has its own pause button,
 * and stops for visitors who ask for reduced motion.
 */
export function SpecialsTicker({ items }: { items: { name: string; priceCents: number }[] }) {
  const [paused, setPaused] = useState(false);
  if (items.length === 0) return null;
  const line = items.map((item) => `${item.name} ${formatZAR(item.priceCents)}`);
  return (
    <div className="flex items-center gap-4 border-b border-navy/10 bg-white pr-4 sm:pr-6">
      <div
        role="region"
        aria-label="Featured dishes and prices"
        className="ticker min-w-0 flex-1 overflow-hidden py-4"
        data-paused={paused ? 'true' : undefined}
      >
        <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap">
          {[...line, ...line].map((text, i) => (
            <span
              key={`${text}-${i}`}
              aria-hidden={i >= line.length ? true : undefined}
              className="flex items-center gap-10 font-display text-lg font-semibold text-navy"
            >
              {text}
              <span className="text-ochre" aria-hidden="true">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? 'Play the prices ticker' : 'Pause the prices ticker'}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 text-sm font-semibold text-navy transition-colors hover:border-navy"
      >
        {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
        {paused ? 'Play' : 'Pause'}
      </button>
    </div>
  );
}
