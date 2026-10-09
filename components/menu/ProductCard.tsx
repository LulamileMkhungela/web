import { AddToCartButton, OrderNowButton } from '@/components/cart/CartButtons';
import { ImageCarousel } from '@/components/media/ImageCarousel';
import { formatZAR } from '@/lib/money';
import type { MenuItem } from '@/lib/types';

export function ProductCard({ item, eager = false }: { item: MenuItem; eager?: boolean }) {
  const soldOut = !item.available;
  const cartItem = {
    lineKey: `item:${item.id}`,
    name: item.name,
    priceCents: item.priceCents,
    image: item.images[0] ?? '',
  };
  return (
    <article id={`item-${item.id}`} className="card flex h-full flex-col overflow-hidden">
      <ImageCarousel images={item.images} alt={item.name} priority={eager} />
      <div aria-hidden="true" className="kasi-strip" />
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold leading-snug">{item.name}</h3>
            <p className="mt-1 text-sm font-semibold text-ochre-deep">{item.subtitle}</p>
          </div>
          <p className="shrink-0 text-right">
            <span className="block text-xl font-bold text-navy">{formatZAR(item.priceCents)}</span>
            <span className="block text-xs text-muted">incl. VAT</span>
          </p>
        </div>
        <p className="leading-relaxed">{item.description}</p>
        {item.tags.length > 0 || soldOut ? (
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
            {soldOut ? <span className="tag tag-warn">Sold out</span> : null}
          </div>
        ) : null}
        <div className="mt-auto grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
          <AddToCartButton item={cartItem} disabled={soldOut} label={soldOut ? 'Sold out' : 'Add to cart'} />
          <OrderNowButton item={cartItem} disabled={soldOut} />
        </div>
      </div>
    </article>
  );
}
