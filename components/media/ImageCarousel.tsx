'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons';

/**
 * Photo carousel. Every photo can be reached with the arrows, the dots, the keyboard
 * (left and right arrow keys when focused) or a swipe. Dots jump straight to their photo.
 */
export function ImageCarousel({
  images,
  alt,
  alts,
  priority = false,
  frame = 'aspect-[4/3]',
  onIndexChange,
}: {
  images: string[];
  alt: string;
  /** Alt text for each photo, in the same order as images. */
  alts?: string[];
  priority?: boolean;
  /** Classes that size the frame. Defaults to a 4:3 box. */
  frame?: string;
  /** Called with the index of the photo on screen whenever it changes. */
  onIndexChange?: (index: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const count = images.length;
  const current = Math.min(index, Math.max(count - 1, 0));

  useEffect(() => {
    onIndexChange?.(current);
  }, [current, onIndexChange]);

  if (count === 0) {
    return <div className={`${frame} bg-cream-deep`} aria-hidden="true" />;
  }

  const multi = count > 1;
  const go = (next: number) => setIndex(((next % count) + count) % count);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!multi) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(current + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(current - 1);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const distance = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(distance) > 40) go(distance < 0 ? current + 1 : current - 1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${alt} photos`}
      tabIndex={multi ? 0 : -1}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={() => {
        startX.current = null;
      }}
      className={`relative select-none overflow-hidden bg-cream-deep ${frame}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={images[current]}
        src={images[current]}
        alt={alts?.[current] ?? `${alt}, photo ${current + 1} of ${count}`}
        className="carousel-img h-full w-full object-cover"
        loading={priority && current === 0 ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />

      {multi ? (
        <>
          <span className="carousel-count" aria-live="polite">
            {current + 1} / {count}
          </span>
          <button
            type="button"
            className="carousel-arrow left-2"
            aria-label="Previous photo"
            onClick={() => go(current - 1)}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="carousel-arrow right-2"
            aria-label="Next photo"
            onClick={() => go(current + 1)}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <div className="carousel-dots">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className="dot-btn"
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === current ? 'true' : undefined}
                onClick={() => go(i)}
              >
                <span className={`dot ${i === current ? 'dot-on' : ''}`} />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
