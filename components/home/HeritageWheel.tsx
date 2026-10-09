'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { formatZAR } from '@/lib/money';

export type WheelItem = { id: string; name: string; priceCents: number; image: string };

const SEGMENT_COLORS = ['#001938', '#B77E23', '#10264d', '#E2AE5B', '#00112a', '#8A5B14', '#1c3566', '#F3E6CA'];
/** Light segments get navy labels so the text stays readable. */
const LIGHT_SEGMENTS = new Set(['#E2AE5B', '#F3E6CA']);

/** Spin the pot: the wheel lands on a random dish from the menu. Add it to your cart, or order it straight away. */
export function HeritageWheel({ items }: { items: WheelItem[] }) {
  const cart = useCart();
  const router = useRouter();
  const pool = items.slice(0, 8);
  const count = pool.length;
  const segment = count ? 360 / count : 360;
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);

  function spin() {
    if (spinning || count < 2) return;
    const pick = Math.floor(Math.random() * count);
    const center = pick * segment + segment / 2;
    const target = (360 - center + 360) % 360;
    const current = ((rotation % 360) + 360) % 360;
    const forward = ((target - current + 360) % 360) + 360 * 6;
    setSpinning(true);
    setWinner(null);
    setRotation(rotation + forward);
    window.setTimeout(() => {
      setSpinning(false);
      setWinner(pool[pick] ?? null);
    }, 4600);
  }

  const gradient = pool
    .map((_, i) => `${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} ${i * segment}deg ${(i + 1) * segment}deg`)
    .join(', ');

  const addToCart = (item: WheelItem) =>
    cart.add({ key: `item:${item.id}`, name: item.name, priceCents: item.priceCents, image: item.image });

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden="true">
        <div className="absolute left-1/2 top-0 z-20 h-0 w-0 -translate-x-1/2 -translate-y-2 border-x-[16px] border-b-[28px] border-x-transparent border-b-ochre drop-shadow-md" />
        <div
          className="absolute inset-0 rounded-full shadow-lift transition-transform ease-[cubic-bezier(.12,.7,.1,1)]"
          style={{
            background: count ? `conic-gradient(${gradient})` : '#001938',
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? '4.6s' : '0s',
          }}
        >
          {pool.map((item, i) => {
            const light = LIGHT_SEGMENTS.has(SEGMENT_COLORS[i % SEGMENT_COLORS.length]);
            return (
              <div key={item.id} className="absolute inset-0" style={{ transform: `rotate(${i * segment + segment / 2}deg)` }}>
                <span
                  className={`absolute left-1/2 top-[11%] w-[34%] -translate-x-1/2 text-center text-[0.72rem] font-bold uppercase leading-tight tracking-wide ${
                    light ? 'text-navy' : 'text-cream'
                  }`}
                  style={light ? undefined : { textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
                >
                  {item.name.length > 18 ? `${item.name.slice(0, 16)}…` : item.name}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-cream bg-navy text-center">
          <span className="font-script text-2xl leading-none text-ochre-bright">spin</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <p className="kicker">Can’t decide?</p>
        <h2 id="wheel-heading" className="text-3xl font-bold text-navy sm:text-4xl">
          Let the pot choose your meal
        </h2>
        <p className="text-[1.02rem] leading-[1.8]">
          Spin the wheel and it lands on one of our dishes at random. Add it to your cart in one tap, or spin again
          until something makes you hungry.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={spin} disabled={spinning || count < 2} className="btn btn-navy">
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            {spinning ? 'Spinning…' : winner ? 'Spin again' : 'Spin the pot'}
          </button>
          <span className="text-sm text-muted" aria-live="polite">
            {spinning ? 'The pot is deciding…' : ''}
          </span>
        </div>
        {winner ? (
          <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center" role="status" aria-live="polite">
            {winner.image ? (
              <Image
                src={winner.image}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 shrink-0 rounded-2xl object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="kicker">The pot says</p>
              <p className="mt-1 text-2xl font-bold text-navy">{winner.name}</p>
              <p className="font-semibold text-ochre-deep">{formatZAR(winner.priceCents)} incl. VAT</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-navy btn-sm" onClick={() => addToCart(winner)}>
                Add to cart
              </button>
              <button
                type="button"
                className="btn btn-ochre btn-sm"
                onClick={() => {
                  addToCart(winner);
                  router.push('/checkout');
                }}
              >
                Order now
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
