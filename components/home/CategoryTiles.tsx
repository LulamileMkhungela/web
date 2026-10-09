import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { MenuCategory } from '@/lib/types';

/** All six menu categories as photo tiles. Each tile opens its section of the menu. */
export function CategoryTiles({ categories }: { categories: MenuCategory[] }) {
  return (
    <section aria-labelledby="categories-heading" className="container-hb pb-16 md:pb-24">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading id="categories-heading" kicker="Everything we serve" script="The full menu" title="Every category on our menu" />
        <Link href="/menu" className="btn btn-navy self-start md:self-auto">
          View the full menu
        </Link>
      </div>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const cover = category.items.find((item) => item.images.length > 0)?.images[0] ?? '';
          return (
            <li key={category.id}>
              <Link
                href={`/menu#category-${category.id}`}
                className="group relative flex min-h-[18rem] overflow-hidden rounded-[2rem] bg-navy no-underline shadow-soft"
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
                <span
                  className="absolute inset-0 bg-[linear-gradient(to_top,#001938,rgba(0,25,56,0.55),rgba(0,25,56,0.1))]"
                  aria-hidden="true"
                />
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
            </li>
          );
        })}
      </ul>
    </section>
  );
}
