import { formatZAR } from '@/lib/money';

export type TickerDish = { id: string; name: string; priceCents: number };

/**
 * Price ticker for featured dishes. It pauses while the pointer is over it, or while a keyboard
 * user has focus inside it. Each dish name is a plain link to that dish on the menu, so the browser
 * makes it the target (it gets a gold ring, see globals.css). Reduced motion gets a still line.
 */
export function SpecialsTicker({ items }: { items: TickerDish[] }) {
  if (items.length === 0) return null;
  return (
    <div className="border-b border-navy/10 bg-white">
      <div role="region" aria-label="Featured dishes and prices" className="ticker overflow-hidden py-4">
        <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap">
          {/* The list is repeated so the loop has no gap. The repeat is hidden from screen readers and the keyboard. */}
          {[...items, ...items].map((item, index) => {
            const repeat = index >= items.length;
            return (
              <a
                key={`${item.id}-${index}`}
                href={`/menu#item-${item.id}`}
                aria-hidden={repeat ? true : undefined}
                tabIndex={repeat ? -1 : undefined}
                className="flex items-center gap-10 font-display text-lg font-semibold text-navy no-underline hover:text-ochre-deep hover:underline underline-offset-4"
              >
                {`${item.name} ${formatZAR(item.priceCents)}`}
                <span className="text-ochre" aria-hidden="true">
                  ✦
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
