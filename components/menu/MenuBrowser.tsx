'use client';

import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/menu/ProductCard';
import type { MenuCategory, MenuItem } from '@/lib/types';

function matches(item: MenuItem, query: string): boolean {
  return [item.name, item.subtitle, item.description, item.tags.join(' '), item.categoryName]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

/** Every category is listed as a jump link. Search and the vegetarian filter narrow the dishes shown. */
export function MenuBrowser({ categories }: { categories: MenuCategory[] }) {
  const [query, setQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const needle = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: category.items.filter((item) => (!vegOnly || item.vegetarian) && (!needle || matches(item, needle))),
      })),
    [categories, vegOnly, needle],
  );
  const total = visible.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <>
      <div id="menu" className="container-hb pt-10 md:pt-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label htmlFor="menu-search" className="label">
              Find a dish
            </label>
            <input
              id="menu-search"
              type="search"
              className="field"
              placeholder="Try mogodu, chicken or samp"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={80}
              autoComplete="off"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="chip"
              aria-pressed={vegOnly}
              onClick={() => setVegOnly((value) => !value)}
            >
              Vegetarian only
            </button>
            <p className="text-sm font-semibold text-navy" aria-live="polite">
              {total} {total === 1 ? 'dish' : 'dishes'}
            </p>
          </div>
        </div>
      </div>

      <nav aria-label="Menu categories" className="sticky top-[4.5rem] z-30 mt-8 border-b border-line bg-cream/95 backdrop-blur">
        <div className="container-hb">
          <div className="chip-row py-3">
            <a href="#menu" className="chip">
              All dishes
            </a>
            {categories.map((category) => (
              <a key={category.id} href={`#category-${category.id}`} className="chip">
                {category.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {visible.map((category) =>
        category.items.length === 0 ? null : (
          <section
            key={category.id}
            id={`category-${category.id}`}
            aria-labelledby={`heading-${category.id}`}
            className="container-hb py-12 md:py-16"
          >
            <header className="flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id={`heading-${category.id}`} className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold">
                  {category.name}
                </h2>
                <p className="mt-1">{category.tagline}</p>
              </div>
              <p className="text-sm font-semibold text-navy">
                {category.items.length} {category.items.length === 1 ? 'dish' : 'dishes'}
              </p>
            </header>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {category.items.map((item, index) => (
                <ProductCard key={item.id} item={item} eager={index === 0} />
              ))}
            </div>
          </section>
        ),
      )}

      {total === 0 ? (
        <div className="container-hb py-16 text-center">
          <p className="text-xl font-semibold text-navy">No dishes match your search.</p>
          <button
            type="button"
            className="btn btn-outline mt-5"
            onClick={() => {
              setQuery('');
              setVegOnly(false);
            }}
          >
            Show all dishes
          </button>
        </div>
      ) : null}
    </>
  );
}
