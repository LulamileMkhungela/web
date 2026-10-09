import { formatZAR } from '@/lib/money';

/** Slow price ticker. Pauses on hover and stops entirely for reduced-motion users. */
export function SpecialsTicker({ items }: { items: { name: string; priceCents: number }[] }) {
  if (items.length === 0) return null;
  const line = items.map((item) => `${item.name} ${formatZAR(item.priceCents)}`);
  return (
    <div className="ticker overflow-hidden border-b border-navy/10 bg-white py-4" aria-label="Featured dishes and prices">
      <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap">
        {[...line, ...line].map((text, i) => (
          <span
            key={`${text}-${i}`}
            aria-hidden={i >= line.length ? true : undefined}
            className="flex items-center gap-10 font-display text-lg font-semibold text-navy"
          >
            {text}
            <span className="text-ochre" aria-hidden="true">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
