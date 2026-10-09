'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { BagIcon } from '@/components/ui/Icons';

export type CartItemInput = { lineKey: string; name: string; priceCents: number; image: string };

/** Header button that opens the cart drawer, with the item count. */
export function CartToggle() {
  const { count, open, ready } = useCart();
  const shown = ready ? count : 0;
  return (
    <button
      type="button"
      onClick={open}
      className="cart-pill"
      aria-label={`Open cart, ${shown} ${shown === 1 ? 'item' : 'items'}`}
    >
      <BagIcon className="h-5 w-5" />
      <span className="hidden sm:inline">Cart</span>
      <span className="cart-count" aria-hidden="true">
        {shown}
      </span>
    </button>
  );
}

/** Adds one line to the cart and confirms it on the button. */
export function AddToCartButton({
  item,
  disabled = false,
  label = 'Add to cart',
}: {
  item: CartItemInput;
  disabled?: boolean;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      className="btn btn-outline btn-block"
      disabled={disabled}
      aria-live="polite"
      onClick={() => {
        add({ key: item.lineKey, name: item.name, priceCents: item.priceCents, image: item.image });
        setAdded(true);
      }}
    >
      {disabled ? label : added ? 'Added to cart' : label}
    </button>
  );
}

/** Adds the dish and goes straight to checkout: one click from the menu to paying. */
export function OrderNowButton({
  item,
  disabled = false,
  label = 'Order now',
}: {
  item: CartItemInput;
  disabled?: boolean;
  label?: string;
}) {
  const { add } = useCart();
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-primary btn-block"
      disabled={disabled}
      onClick={() => {
        add({ key: item.lineKey, name: item.name, priceCents: item.priceCents, image: item.image });
        router.push('/checkout');
      }}
    >
      {label}
    </button>
  );
}
