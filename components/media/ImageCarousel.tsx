'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Props = {
  images: string[];
  alt: string;
  /** Tailwind aspect or height classes for the frame, e.g. "aspect-[4/3]" or "h-full". */
  ratio?: string;
  className?: string;
  autoplayMs?: number;
  lightbox?: boolean;
  priority?: boolean;
  onIndexChange?: (index: number) => void;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Photo carousel: clickable dots, previous/next arrows, swipe, arrow keys,
 * an "n / total" counter and a lightbox that shows every photo as a thumbnail strip.
 */
export function ImageCarousel({
  images,
  alt,
  ratio = 'aspect-[4/3]',
  className = '',
  autoplayMs,
  lightbox = true,
  priority = false,
  onIndexChange,
}: Props) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startX = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const go = useCallback(
    (target: number) => {
      if (count === 0) return;
      setIndex(((target % count) + count) % count);
    },
    [count],
  );
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  useEffect(() => {
    if (!autoplayMs || count < 2 || paused || reducedMotion) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => clearInterval(timer);
  }, [autoplayMs, count, paused, reducedMotion]);

  if (count === 0) {
    return <div className={`${ratio} ${className} bg-navy/10`} aria-hidden="true" />;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) return;
    startX.current = event.clientX;
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current === null || count < 2) return;
    const dx = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') prev();
    if (event.key === 'ArrowRight') next();
  }
  function openLightbox(i: number) {
    if (!lightbox) return;
    setLightboxIndex(i);
    dialogRef.current?.showModal();
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${alt} photos`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (startX.current = null)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`group relative w-full touch-pan-y overflow-hidden bg-navy/10 ${ratio} ${className}`}
    >
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out will-change-transform"
        style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
      >
        {images.map((src, i) => (
          <figure
            key={`${src}-${i}`}
            className="relative m-0 h-full w-full shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`Photo ${i + 1} of ${count}`}
            aria-hidden={i !== index}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={count > 1 ? `${alt}, photo ${i + 1} of ${count}` : alt}
              loading={i === 0 || priority ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              onClick={() => openLightbox(i)}
              className={`h-full w-full select-none object-cover ${lightbox ? 'cursor-zoom-in' : ''}`}
            />
          </figure>
        ))}
      </div>

      {count > 1 ? (
        <>
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-navy/75 px-3 py-1 text-xs font-semibold text-cream">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-navy shadow-soft transition-transform hover:scale-105 hover:bg-ochre-bright"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-navy shadow-soft transition-transform hover:scale-105 hover:bg-ochre-bright"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center">
            <div
              role="tablist"
              aria-label="Choose a photo"
              className="flex items-center gap-1 rounded-full bg-navy/60 px-2 py-1 backdrop-blur-sm"
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  onClick={() => go(i)}
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all duration-300 ${
                      i === index ? 'w-6 bg-ochre-bright' : 'w-2.5 bg-cream/75 hover:bg-cream'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {lightbox ? (
        <dialog
          ref={dialogRef}
          aria-label={`${alt} photos`}
          className="m-auto w-[min(96vw,1120px)] overflow-hidden rounded-[2rem] bg-navy-deep p-0 text-cream shadow-lift"
          onClick={(event) => {
            if (event.target === dialogRef.current) dialogRef.current?.close();
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + count) % count);
            if (event.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % count);
          }}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close photos"
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream text-navy"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="relative aspect-[4/3] w-full bg-black sm:aspect-[16/10]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[lightboxIndex]}
                alt={`${alt}, photo ${lightboxIndex + 1} of ${count}`}
                className="h-full w-full object-contain"
              />
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((i) => (i - 1 + count) % count)}
                    aria-label="Previous photo"
                    className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-navy"
                  >
                    <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((i) => (i + 1) % count)}
                    aria-label="Next photo"
                    className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-navy"
                  >
                    <ChevronRight className="h-6 w-6" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>
            {count > 1 ? (
              <div className="flex gap-3 overflow-x-auto p-4" role="list" aria-label="All photos">
                {images.map((src, i) => (
                  <button
                    key={`thumb-${src}-${i}`}
                    type="button"
                    role="listitem"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === lightboxIndex}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity ${
                      i === lightboxIndex ? 'border-ochre-bright opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
