import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/menu/ProductCard';
import { PageHeader } from '@/components/site/PageHeader';
import { SearchBox } from '@/components/search/SearchBox';
import { BRAND } from '@/lib/config';
import { SEARCH_SUGGESTIONS } from '@/lib/content';
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
      <PageHeader kicker="Search" title={query ? `Results for “${query}”` : 'Search the menu'}>
        <p>Search by dish name or ingredient, for example mogodu, kota or samp.</p>
      </PageHeader>

      <section className="container-hb py-12 md:py-16" aria-live="polite">
        <div className="max-w-3xl">
          <SearchBox variant="page" defaultValue={query} />
        </div>

        <div className="mt-10">
          {query && results.length > 0 ? (
            <>
              <p className="mb-6 font-semibold text-navy">
                {results.length} {results.length === 1 ? 'dish' : 'dishes'} found
              </p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((item, index) => (
                  <ProductCard key={item.id} item={item} eager={index < 3} />
                ))}
              </div>
            </>
          ) : query ? (
            <div className="card mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center sm:p-10">
              <p className="text-xl font-semibold text-navy">We could not find “{query}” on the menu</p>
              <p>Try a different word, or one of these popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SEARCH_SUGGESTIONS.map((suggestion) => (
                  <Link key={suggestion} href={`/search?q=${encodeURIComponent(suggestion)}`} className="chip">
                    {suggestion}
                  </Link>
                ))}
              </div>
              <p className="mt-2 text-sm">
                Looking for something that is not listed?{' '}
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-4">
                  Ask us on WhatsApp (opens in a new tab)
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="card mx-auto max-w-2xl p-8 text-center sm:p-10">
              <p className="text-xl font-semibold text-navy">Search by dish, ingredient or word</p>
              <p className="mt-2">
                Try “mogodu”, “kota”, “samp”, “chicken” or “spicy”, or browse the{' '}
                <Link href="/menu" className="font-semibold text-navy underline underline-offset-4">
                  full menu
                </Link>
                .
              </p>
              <p className="mt-4 text-sm">{BRAND.suburb}, {BRAND.city}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
