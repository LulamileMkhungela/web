'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from './CartProvider';
import { CloseIcon, MinusIcon, PlusIcon } from '@/components/ui/Icons';
import { formatZAR } from '@/lib/money';

export function CartDrawer() {
  const { lines, count, totalCents, vatCents, isOpen, close, setQty, remove, ready } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label="Close cart" onClick={close} className="absolute inset-0 bg-navy/60" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-lift"
      >
        <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-4">
          <h2 id="cart-title" className="text-2xl font-bold">
            Your cart{count ? ` (${count})` : ''}
          </h2>
          <button type="button" className="icon-btn" onClick={close}>
            <CloseIcon />
            <span className="sr-only">Close cart</span>
          </button>
        </header>

        {!ready ? (
          <p className="p-5">Loading your cart…</p>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 p-6">
            <p className="text-xl font-semibold text-navy">Your cart is empty</p>
            <p>Add a dish from the menu and it will appear here.</p>
            <Link href="/menu" onClick={close} className="btn btn-primary">
              Browse the menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-5">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 rounded-2xl bg-white p-3 shadow-soft">
                  {line.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="h-20 w-20 shrink-0 rounded-xl bg-cream-deep" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold leading-snug text-navy">{line.name}</p>
                      <p className="shrink-0 font-semibold text-navy">{formatZAR(line.priceCents * line.qty)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="stepper" role="group" aria-label={`Quantity of ${line.name}`}>
                        <button type="button" onClick={() => setQty(line.key, line.qty - 1)} aria-label={`Take one ${line.name} out`}>
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span aria-live="polite">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty + 1)}
                          aria-label={`Add one more ${line.name}`}
                          disabled={line.qty >= 20}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-sm font-semibold text-navy underline underline-offset-4"
                        onClick={() => remove(line.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="space-y-4 border-t border-line bg-white p-5">
              <div className="flex items-center justify-between text-navy">
                <span className="font-semibold">Total incl. VAT</span>
                <span className="text-2xl font-bold">{formatZAR(totalCents)}</span>
              </div>
              <p className="text-sm">Includes VAT of {formatZAR(vatCents)}.</p>
              <Link href="/checkout" onClick={close} className="btn btn-primary btn-block btn-lg">
                Checkout
              </Link>
              <button type="button" onClick={close} className="btn btn-outline btn-block">
                Keep browsing
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
