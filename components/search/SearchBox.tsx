'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { SEARCH_SUGGESTIONS } from '@/lib/content';
import { formatZAR } from '@/lib/money';

type Result = {
  id: string;
  name: string;
  subtitle: string;
  priceCents: number;
  image: string;
  available: boolean;
  categoryName: string;
};

export function SearchBox({
  autoFocus = false,
  variant = 'default',
  onNavigate,
}: {
  autoFocus?: boolean;
  variant?: 'default' | 'hero';
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await res.json()) as { items: Result[] };
        setResults(data.items);
      } catch {
        /* aborted by a newer keystroke */
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function go(q: string) {
    setOpen(false);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (q) go(q);
  }

  const showList = open && query.trim().length > 0;
  return (
    <div className="relative w-full">
      <form role="search" onSubmit={submit} className="relative">
        <label htmlFor={inputId} className="sr-only">
          Search the menu
        </label>
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder={variant === 'hero' ? 'Search the menu' : 'Search dishes, e.g. mogodu, kota, magwinya'}
          aria-controls={listId}
          aria-expanded={showList}
          className={`field pl-13 pr-32 ${variant === 'hero' ? 'h-14 rounded-full text-base shadow-soft' : 'h-13 rounded-full'}`}
          style={{ paddingLeft: '3.25rem' }}
        />
        <button type="submit" className="btn btn-navy btn-sm absolute right-2 top-1/2 -translate-y-1/2">
          Search
        </button>
      </form>

      {showList ? (
        <div
          id={listId}
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-lift"
        >
          {loading && results.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Searching…</p>
          ) : results.length === 0 ? (
            <div className="px-5 py-4">
              <p className="text-sm text-body">No dishes match “{query.trim()}”.</p>
              <p className="mt-1 text-sm text-muted">
                Try one of the suggestions below, or ask us on WhatsApp for something not on the menu.
              </p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-navy/5 overflow-y-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/menu#item-${r.id}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-4 px-4 py-3 no-underline hover:bg-cream"
                  >
                    {r.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" loading="lazy" />
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-navy">{r.name}</span>
                      <span className="block truncate text-sm text-muted">
                        {r.categoryName}
                        {r.available ? '' : ' · Sold out'}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-navy">{formatZAR(r.priceCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-navy/5 px-4 py-3">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(query.trim())}
              className="btn-quiet w-full justify-start text-left"
            >
              See all results for “{query.trim()}”
            </button>
          </div>
        </div>
      ) : null}

      {variant === 'hero' && !query.trim() ? (
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Popular searches">
          <span className="text-sm text-cream/70">Popular:</span>
          {SEARCH_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => go(s)}
              className="rounded-full border border-cream/25 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-cream transition-colors hover:border-ochre-bright hover:text-ochre-bright"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
