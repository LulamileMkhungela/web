'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useCart } from './CartProvider';
import { BagIcon } from '@/components/ui/Icons';

export type CartItemInput = { lineKey: string; name: string; priceCents: number; image: string };

/**
 * Header button that opens the cart drawer, with the item count. Outlined while the cart is empty and
 * filled navy once something has been added.
 */
export function CartToggle() {
  const { count, open, ready } = useCart();
  const shown = ready ? count : 0;
  return (
    <button
      type="button"
      onClick={open}
      className="cart-pill"
      data-filled={shown > 0 ? 'true' : undefined}
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

/**
 * Adds one line to the cart. Once the dish is in the cart the button turns solid and says "In cart"
 * (or "2 in cart"). The label is short so it fits on one line beside "Order now". It stays solid
 * after a reload.
 */
export function AddToCartButton({
  item,
  disabled = false,
  label = 'Add to cart',
}: {
  item: CartItemInput;
  disabled?: boolean;
  label?: string;
}) {
  const { add, lines } = useCart();
  const line = lines.find((entry) => entry.key === item.lineKey);
  const inCart = Boolean(line) && !disabled;
  let text = label;
  if (!disabled && line) text = line.qty > 1 ? `${line.qty} in cart` : 'In cart';
  return (
    <button
      type="button"
      className={`btn btn-block ${inCart ? 'btn-navy' : 'btn-outline'}`}
      disabled={disabled}
      aria-live="polite"
      data-in-cart={inCart ? 'true' : undefined}
      onClick={() => add({ key: item.lineKey, name: item.name, priceCents: item.priceCents, image: item.image })}
    >
      {inCart ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
      {text}
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
