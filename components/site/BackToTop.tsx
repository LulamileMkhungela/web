'use client';

import { useEffect, useState } from 'react';
import { UpIcon } from '@/components/ui/Icons';

/** Appears after the visitor scrolls down, and returns them to the top of the page. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 600);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('main')?.focus({ preventScroll: true });
      }}
      className="fixed bottom-[5.25rem] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-cream shadow-lift ring-2 ring-ochre/60 transition hover:bg-navy-soft lg:bottom-6 lg:right-6"
    >
      <UpIcon className="h-5 w-5" />
    </button>
  );
}
