'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Leaf, Plus, X } from 'lucide-react';
import { ImageCarousel } from '@/components/media/ImageCarousel';
import { useCart } from '@/components/cart/CartProvider';
import { formatZAR } from '@/lib/money';
import type { MenuItem } from '@/lib/types';

const BADGES = ['Bestseller', 'Braai', 'Combo', 'Breakfast', 'Street food', 'Setswana', 'Traditional'];

export function ProductCard({ item, eager = false }: { item: MenuItem; eager?: boolean }) {
  const cart = useCart();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const line = {
    key: `item:${item.id}`,
    name: item.name,
    priceCents: item.priceCents,
    image: item.images[0] ?? '',
  };
  const badges = item.tags.filter((tag) => BADGES.includes(tag)).slice(0, 2);
  const chips = item.tags.filter((tag) => !BADGES.includes(tag) && tag !== 'Vegetarian').slice(0, 2);

  return (
    <article
      id={`item-${item.id}`}
      className="card group flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative">
        <ImageCarousel
          images={item.images}
          alt={item.name}
          ratio="aspect-[4/3]"
          priority={eager}
          className="rounded-none"
        />
        {!item.available ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-navy/75">
            <span className="rounded-full bg-cream px-5 py-2 text-sm font-bold text-navy">Sold out today</span>
          </div>
        ) : null}
        {badges.length ? (
          <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-1.5">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full bg-ochre-bright px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-navy">
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-ochre-deep">{item.categoryName}</p>
            <h3 className="mt-1 text-[1.4rem] font-bold leading-tight text-navy">{item.name}</h3>
            <p className="mt-1 text-sm font-medium text-ochre-deep">{item.subtitle}</p>
          </div>
          <p className="shrink-0 text-right">
            <span className="block font-display text-[1.6rem] font-bold leading-none text-navy">{formatZAR(item.priceCents)}</span>
            <span className="mt-1 block text-[0.68rem] text-muted">incl. VAT</span>
          </p>
        </div>

        <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-body">{item.description}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {item.vegetarian ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 font-semibold text-success">
              <Leaf className="h-3.5 w-3.5" aria-hidden="true" /> Vegetarian
            </span>
          ) : null}
          {item.spice > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 font-semibold text-danger">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" /> {item.spice === 1 ? 'Mild heat' : 'Spicy'}
            </span>
          ) : null}
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-navy/5 px-2.5 py-1 font-medium text-navy">
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-3">
          <button
            type="button"
            disabled={!item.available}
            onClick={() => cart.add(line)}
            className="btn btn-navy w-full"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add to cart
          </button>
          <button
            type="button"
            disabled={!item.available}
            onClick={() => {
              cart.add(line);
              router.push('/checkout');
            }}
            className="btn btn-ochre w-full"
            aria-label={`Order ${item.name} now`}
          >
            Order
          </button>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="btn-quiet self-start px-0"
        >
          Read the story
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={`story-${item.id}`}
        className="m-auto w-[min(94vw,820px)] overflow-hidden rounded-[2rem] bg-cream p-0 text-body shadow-lift"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <ImageCarousel images={item.images} alt={item.name} ratio="aspect-[16/10]" lightbox />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close story"
              className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream text-navy"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-5 p-7 sm:p-9">
            <div>
              <p className="kicker">{item.categoryName}</p>
              <h3 id={`story-${item.id}`} className="mt-2 text-3xl font-bold text-navy">
                {item.name}
              </h3>
              <p className="mt-2 font-medium text-ochre-deep">{item.subtitle}</p>
            </div>
            <p className="text-[1.02rem] leading-[1.8]">{item.story}</p>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-5">
              <p className="font-display text-3xl font-bold text-navy">
                {formatZAR(item.priceCents)} <span className="font-sans text-sm font-normal text-muted">incl. VAT</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!item.available}
                  onClick={() => cart.add(line)}
                  className="btn btn-navy"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  disabled={!item.available}
                  onClick={() => {
                    cart.add(line);
                    router.push('/checkout');
                  }}
                  className="btn btn-ochre"
                >
                  Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </article>
  );
}
