'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { formatZAR } from '@/lib/money';

type Hit = {
  id: string;
  name: string;
  subtitle: string;
  priceCents: number;
  image: string;
  available: boolean;
  categoryName: string;
};

/**
 * Search field. In the header ("panel") it shows live suggestions as you type.
 * On the search page it submits a search and shows the results there.
 */
export function SearchBox({
  variant = 'page',
  defaultValue = '',
  autoFocus = false,
  onNavigate,
}: {
  variant?: 'page' | 'panel';
  defaultValue?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState(defaultValue);
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (variant !== 'panel') return;
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await res.json()) as { items?: Hit[] };
        setHits(data.items ?? []);
        setStatus('done');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setStatus('error');
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, variant]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    onNavigate?.();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  const showPanel = variant === 'panel' && query.trim().length >= 2;

  return (
    <div className="w-full">
      <form role="search" onSubmit={submit} className="flex w-full items-stretch gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="sr-only">
            Search dishes
          </label>
          <input
            id={inputId}
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus={autoFocus}
            placeholder="Search mogodu, kota, samp…"
            className="field"
            autoComplete="off"
            maxLength={80}
          />
        </div>
        <button type="submit" className="btn btn-primary shrink-0">
          Search
        </button>
      </form>

      {showPanel ? (
        <div className="mt-3 rounded-2xl border border-line bg-white p-2" aria-live="polite">
          {status === 'loading' ? <p className="p-3 text-sm">Searching…</p> : null}
          {status === 'error' ? <p className="p-3 text-sm">Search is unavailable right now. Press Search to try again.</p> : null}
          {status === 'done' && hits.length === 0 ? (
            <p className="p-3 text-sm">No dishes match “{query.trim()}”. Try a shorter word.</p>
          ) : null}
          {hits.length > 0 ? (
            <ul className="flex flex-col">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <Link
                    href={`/menu#item-${hit.id}`}
                    onClick={onNavigate}
                    className="flex items-center gap-4 rounded-xl p-2 no-underline hover:bg-cream focus-visible:bg-cream"
                  >
                    {hit.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hit.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-navy">{hit.name}</span>
                      <span className="block truncate text-sm">{hit.categoryName}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-navy">{formatZAR(hit.priceCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {hits.length > 0 ? (
            <div className="border-t border-line p-2">
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={onNavigate}
                className="font-semibold text-navy underline underline-offset-4"
              >
                See all results
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
