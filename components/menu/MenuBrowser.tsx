'use client';

import { useEffect, useMemo, useState } from 'react';
import { Leaf, Search } from 'lucide-react';
import { ProductCard } from '@/components/menu/ProductCard';
import type { MenuCategory, MenuItem } from '@/lib/types';

function matches(item: MenuItem, query: string, vegOnly: boolean): boolean {
  if (vegOnly && !item.vegetarian) return false;
  if (!query) return true;
  const haystack = `${item.name} ${item.subtitle} ${item.description} ${item.tags.join(' ')} ${item.categoryName}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function MenuBrowser({ categories }: { categories: MenuCategory[] }) {
  const [query, setQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '');
  const [stickyTop, setStickyTop] = useState(124);

  // Sit the category bar exactly under the site header, whatever its height.
  useEffect(() => {
    const chrome = document.querySelector<HTMLElement>('[data-site-chrome]');
    if (!chrome) return;
    const measure = () => setStickyTop(Math.round(chrome.getBoundingClientRect().bottom));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(chrome);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const filtered = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, items: c.items.filter((i) => matches(i, query.trim(), vegOnly)) }))
        .filter((c) => c.items.length > 0),
    [categories, query, vegOnly],
  );
  const total = filtered.reduce((sum, c) => sum + c.items.length, 0);

  // Highlight the category tab that is currently in view.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-cat]'));
    if (!sections.length || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.getAttribute('data-cat') ?? '');
      },
      { rootMargin: '-34% 0px -56% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [filtered.length]);

  function jump(id: string) {
    setActiveId(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  let eagerRemaining = 3;
  return (
    <div>
      <div className="sticky z-30 border-y border-navy/10 bg-cream/95 backdrop-blur-md" style={{ top: stickyTop }}>
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-5 py-3 sm:px-8">
          <nav aria-label="Menu categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {categories.map((c) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => jump(c.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-navy bg-navy text-cream'
                      : 'border-navy/15 bg-white text-navy hover:border-ochre hover:text-ochre-deep'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </nav>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <label htmlFor="menu-filter" className="sr-only">
                Filter the menu
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="menu-filter"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter the menu, e.g. chicken, samp, spicy"
                className="field h-12 rounded-full pl-11"
                style={{ paddingLeft: '2.75rem' }}
                autoComplete="off"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-pressed={vegOnly}
                onClick={() => setVegOnly((v) => !v)}
                className={`inline-flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors ${
                  vegOnly ? 'border-success bg-success text-white' : 'border-navy/15 bg-white text-navy hover:border-success'
                }`}
              >
                <Leaf className="h-4 w-4" aria-hidden="true" />
                Vegetarian only
              </button>
              <p className="whitespace-nowrap text-sm text-muted" aria-live="polite">
                {total} {total === 1 ? 'dish' : 'dishes'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        {filtered.length === 0 ? (
          <div className="card my-14 flex flex-col items-center gap-3 px-8 py-16 text-center">
            <p className="text-xl font-semibold text-navy">No dishes match that search</p>
            <p>Try “mogodu”, “kota”, “samp” or “magwinya”, or clear the filter to see the whole menu.</p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setVegOnly(false);
              }}
              className="btn btn-navy mt-3"
            >
              Show the full menu
            </button>
          </div>
        ) : null}

        {filtered.map((category) => (
          <section
            key={category.id}
            id={`cat-${category.id}`}
            data-cat={category.id}
            aria-labelledby={`cat-title-${category.id}`}
            className="scroll-mt-48 py-16 first:pt-14"
          >
            <header className="mb-10 grid gap-3 md:grid-cols-[1fr_1fr] md:items-end">
              <div>
                <p className="kicker">{category.tagline}</p>
                <h2 id={`cat-title-${category.id}`} className="mt-2 text-[clamp(2rem,3.6vw,3rem)] font-bold text-navy">
                  {category.name}
                </h2>
              </div>
              <p className="text-[1.02rem] leading-[1.75] text-body md:justify-self-end md:max-w-md">{category.description}</p>
            </header>
            <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {category.items.map((item) => {
                const eager = eagerRemaining > 0;
                if (eager) eagerRemaining -= 1;
                return <ProductCard key={item.id} item={item} eager={eager} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
