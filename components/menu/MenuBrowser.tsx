'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductCard } from '@/components/menu/ProductCard';
import type { MenuCategory, MenuItem } from '@/lib/types';

const ALL = 'all';
/** A category is the one in view once its heading has moved above this line (px from the top). */
const SPY_LINE = 200;
/** After a tab is clicked, scroll updates are ignored until its smooth scroll has finished. */
const CLICK_LOCK_MS = 1200;

function matches(item: MenuItem, query: string): boolean {
  return [item.name, item.subtitle, item.description, item.tags.join(' '), item.categoryName]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

/**
 * Every category is a tab. The tab for the section in view (or the one just clicked) is shown as
 * current. A link into the menu, such as /menu#item-x from the home ticker, selects its category.
 * Search and the vegetarian filter narrow the dishes shown.
 */
export function MenuBrowser({ categories }: { categories: MenuCategory[] }) {
  const [query, setQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [active, setActive] = useState<string>(ALL);
  const lockUntil = useRef(0);
  const tabRow = useRef<HTMLDivElement>(null);
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

  // Start from the link the visitor opened, if it names a category or a dish.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('category-')) setActive(hash.slice('category-'.length));
    if (hash.startsWith('item-')) {
      const id = hash.slice('item-'.length);
      const owner = categories.find((category) => category.items.some((item) => item.id === id));
      if (owner) setActive(owner.id);
    }
  }, [categories]);

  // While the visitor scrolls, the current tab is the last category heading above the line.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (Date.now() < lockUntil.current) return;
      let current = ALL;
      for (const category of categories) {
        const heading = document.getElementById(`category-${category.id}`);
        if (heading && heading.getBoundingClientRect().top <= SPY_LINE) current = category.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [categories]);

  // On phones the tab row scrolls sideways. Keep the current tab in view inside that row only.
  useEffect(() => {
    const row = tabRow.current;
    const tab = row ? Array.from(row.querySelectorAll<HTMLElement>('a[data-tab]')).find((el) => el.dataset.tab === active) : undefined;
    if (!row || !tab) return;
    const rowBox = row.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    const left = row.scrollLeft + (tabBox.left - rowBox.left) - (rowBox.width - tabBox.width) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [active]);

  const choose = (tab: string) => {
    setActive(tab);
    lockUntil.current = Date.now() + CLICK_LOCK_MS;
  };

  return (
    <>
      <div id="menu" className="container-hb relative isolate pt-10 md:pt-12">
        <div aria-hidden="true" className="kasi-wash" />
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
          <div ref={tabRow} className="chip-row py-3 lg:flex-wrap lg:overflow-visible">
            <a
              href="#menu"
              data-tab={ALL}
              className="chip"
              aria-current={active === ALL ? 'true' : undefined}
              onClick={() => choose(ALL)}
            >
              All dishes
            </a>
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#category-${category.id}`}
                data-tab={category.id}
                className="chip"
                aria-current={active === category.id ? 'true' : undefined}
                onClick={() => choose(category.id)}
              >
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
            <header className="relative isolate flex flex-col gap-2 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div aria-hidden="true" className="kasi-wash" />
              <div>
                <h2 id={`heading-${category.id}`} className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold">
                  <span aria-hidden="true" className="kasi-diamond" />
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
