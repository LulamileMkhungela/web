import Link from 'next/link';
import { CATEGORY_TILES } from '@/lib/content';
import type { MenuCategory } from '@/lib/types';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function CategoryTiles({ categories }: { categories: MenuCategory[] }) {
  return (
    <section aria-labelledby="categories-heading" className="mx-auto w-full max-w-[1240px] px-5 pb-24 sm:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading id="categories-heading" kicker="Everything we serve" script="The full table" title="Every category on our menu" />
        <Link href="/menu" className="btn btn-navy self-start md:self-auto">
          View the full menu
        </Link>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const tile = CATEGORY_TILES.find((t) => t.id === category.id);
          return (
            <Link
              key={category.id}
              href={`/menu#cat-${category.id}`}
              className="group relative flex min-h-[18rem] overflow-hidden rounded-[2rem] bg-navy no-underline shadow-soft"
            >
              {tile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tile.image}
                  alt={tile.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : null}
              <span className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/10" aria-hidden="true" />
              <span className="relative mt-auto flex w-full flex-col gap-2 p-7 text-cream">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ochre-bright">
                  {category.items.length} {category.items.length === 1 ? 'dish' : 'dishes'}
                </span>
                <span className="font-display text-2xl font-bold leading-tight">{category.name}</span>
                <span className="text-sm text-cream/80">{category.tagline}</span>
                <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ochre-bright">
                  Browse {category.name.toLowerCase()} <span aria-hidden="true">→</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
