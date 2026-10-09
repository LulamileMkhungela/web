'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { DEFAULT_STORE_LINKS } from '@/lib/config';
import { formatZAR } from '@/lib/money';
import { basketText } from '@/lib/whatsapp';
import type { StoreLinks } from '@/lib/types';

export function CartDrawer({ storeLinks }: { storeLinks: StoreLinks }) {
  const cart = useCart();
  const { isOpen, close, lines, setQty, remove, totalCents, vatCents, count } = cart;
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const ubereats = storeLinks.ubereats || DEFAULT_STORE_LINKS.ubereats;
  const mrd = storeLinks.mrd || DEFAULT_STORE_LINKS.mrd;

  async function copyBasket() {
    try {
      await navigator.clipboard.writeText(basketText(lines));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="no-print fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close basket"
        onClick={close}
        className="absolute inset-0 bg-navy/60 backdrop-blur-[2px]"
        tabIndex={-1}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="basket-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-cream shadow-lift"
      >
        <div className="flex items-center justify-between gap-4 border-b border-navy/10 px-6 py-5">
          <div>
            <p className="kicker">Your basket</p>
            <h2 id="basket-title" className="mt-1 text-2xl font-bold">
              {count} {count === 1 ? 'item' : 'items'}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/15 bg-white text-navy"
          >
            <span className="sr-only">Close basket</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ochre-wash text-ochre-deep">
              <ShoppingBag className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="text-lg font-semibold text-navy">Your basket is empty</p>
            <p className="text-sm">Choose a traditional favourite from the menu and it will appear here.</p>
            <Link href="/menu" onClick={close} className="btn btn-navy">
              Browse the menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-navy/10 overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-5">
                  {line.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.image} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <span className="h-20 w-20 shrink-0 rounded-2xl bg-navy/10" aria-hidden="true" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold leading-snug text-navy">{line.name}</p>
                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        className="shrink-0 rounded-full p-1.5 text-muted transition-colors hover:bg-navy/5 hover:text-danger"
                        aria-label={`Remove ${line.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex h-10 items-center rounded-full border border-navy/15 bg-white">
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty - 1)}
                          className="inline-flex h-10 w-10 items-center justify-center text-navy"
                          aria-label={`Reduce ${line.name}`}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="min-w-[2rem] text-center font-semibold text-navy" aria-live="polite">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty + 1)}
                          className="inline-flex h-10 w-10 items-center justify-center text-navy"
                          aria-label={`Add one more ${line.name}`}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="font-semibold text-navy">{formatZAR(line.priceCents * line.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-navy/10 bg-white px-6 py-5">
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <dt>Total including VAT</dt>
                  <dd className="text-lg font-bold text-navy">{formatZAR(totalCents, true)}</dd>
                </div>
                <div className="flex justify-between text-muted">
                  <dt>Of which VAT (15%)</dt>
                  <dd>{formatZAR(vatCents, true)}</dd>
                </div>
              </dl>
              <div className="mt-5 grid gap-3">
                <Link href="/checkout" onClick={close} className="btn btn-navy w-full">
                  Checkout
                </Link>
                <Link href="/checkout?channel=whatsapp" onClick={close} className="btn btn-outline w-full">
                  Send basket on WhatsApp
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>Prefer delivery? Order these on:</span>
                <span className="flex gap-3">
                  <a href={ubereats} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-4">
                    Uber Eats
                  </a>
                  <a href={mrd} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-4">
                    Mr D
                  </a>
                  <button type="button" onClick={copyBasket} className="inline-flex items-center gap-1 font-semibold text-navy underline underline-offset-4">
                    {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    {copied ? 'Copied' : 'Copy basket'}
                  </button>
                </span>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
