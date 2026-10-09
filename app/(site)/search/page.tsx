import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/menu/ProductCard';
import { SearchBox } from '@/components/search/SearchBox';
import { SEARCH_SUGGESTIONS } from '@/lib/content';
import { BRAND } from '@/lib/config';
import { listItems } from '@/lib/menu';
import { searchItems } from '@/lib/search';
import { whatsappLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search the menu',
  description: 'Search Heritage Bites dishes by name or by what you are craving.',
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = (params.q ?? '').slice(0, 80).trim();
  const results = query ? searchItems(listItems(), query, 24) : [];
  const waLink = whatsappLink(`Hi Heritage Bites, do you have ${query || 'this dish'}?`);

  return (
    <>
      <section className="grain relative overflow-hidden bg-navy text-cream">
        <div className="mx-auto w-full max-w-[1240px] px-5 pb-16 pt-14 sm:px-8">
          <p className="kicker kicker-light">Search</p>
          <h1 className="mt-3 text-[clamp(2.4rem,4.6vw,3.9rem)] font-bold text-cream">
            {query ? `Results for “${query}”` : 'What are you craving?'}
          </h1>
          <div className="mt-8 max-w-3xl">
            <SearchBox />
          </div>
        </div>
        <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-8" aria-live="polite">
        {query && results.length > 0 ? (
          <>
            <p className="mb-8 text-sm font-semibold text-navy">
              {results.length} {results.length === 1 ? 'dish' : 'dishes'} found
            </p>
            <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((item, i) => (
                <ProductCard key={item.id} item={item} eager={i < 3} />
              ))}
            </div>
          </>
        ) : query ? (
          <div className="card mx-auto flex max-w-2xl flex-col items-center gap-4 p-10 text-center">
            <p className="text-xl font-semibold text-navy">We could not find “{query}” on the menu</p>
            <p>Try a different word, or one of these popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SEARCH_SUGGESTIONS.map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy no-underline hover:border-ochre hover:text-ochre-deep"
                >
                  {s}
                </Link>
              ))}
            </div>
            <p className="mt-2 text-sm">
              Looking for something that is not listed?{' '}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-4">
                Ask us on WhatsApp (opens in new tab)
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="card mx-auto max-w-2xl p-10 text-center">
            <p className="text-xl font-semibold text-navy">Search by dish, ingredient or word</p>
            <p className="mt-2">
              Try “mogodu”, “kota”, “samp”, “chicken” or “spicy”. You can also browse the{' '}
              <Link href="/menu" className="font-semibold text-navy underline underline-offset-4">
                full menu
              </Link>
              {' '}or call us on {BRAND.phoneDisplay}.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
