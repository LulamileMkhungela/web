import Link from 'next/link';
import type { MenuCategory } from '@/lib/types';

/** All six menu categories. Each tile jumps to its section of the menu. */
export function CategoryTiles({ categories }: { categories: MenuCategory[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const cover = category.items.find((item) => item.images.length > 0)?.images[0] ?? '';
        return (
          <li key={category.id}>
            <Link
              href={`/menu#category-${category.id}`}
              className="card group flex h-full overflow-hidden no-underline transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative w-32 shrink-0 bg-cream-deep sm:w-36">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-5">
                <h3 className="text-xl font-bold leading-tight group-hover:text-ochre-deep">{category.name}</h3>
                <p className="text-[0.95rem] leading-relaxed">{category.tagline}</p>
                <p className="mt-auto pt-3 text-sm font-semibold text-navy">
                  {category.items.length} {category.items.length === 1 ? 'dish' : 'dishes'} · View
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
