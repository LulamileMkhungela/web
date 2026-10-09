'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, MessageCircle, Printer, RotateCw } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { BRAND } from '@/lib/config';
import { formatZAR } from '@/lib/money';
import { CHANNEL_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, STATUS_LABEL, TRACK_STEPS } from '@/lib/status';
import { formatSAST, formatSASTDate } from '@/lib/time';
import { whatsappLink } from '@/lib/whatsapp';
import type { OrderView } from '@/lib/types';

const TERMINAL = ['collected', 'cancelled'];

export function OrderTracker({
  order: initial,
  imageByKey,
  waNumber,
}: {
  order: OrderView;
  imageByKey: Record<string, string>;
  waNumber: string;
}) {
  const [order, setOrder] = useState(initial);
  const cart = useCart();
  const router = useRouter();
  const [reordered, setReordered] = useState(false);

  useEffect(() => {
    if (TERMINAL.includes(order.status)) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.token}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { order: OrderView };
        setOrder(data.order);
      } catch {
        /* keep the last known status */
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [order.status, order.token]);

  const stepIndex = TRACK_STEPS.findIndex((s) => s.status === order.status);
  const cancelled = order.status === 'cancelled';
  const awaiting = order.status === 'awaiting_payment';
  const pickup = order.pickupAt ? formatSAST(order.pickupAt) : null;
  const pickupDate = order.pickupAt ? formatSASTDate(order.pickupAt) : null;
  const waMessage = whatsappLink(`Hi Heritage Bites, a question about my order ${order.displayNumber}.`, waNumber);

  function orderAgain() {
    for (const line of order.lines) {
      cart.add({
        key: line.key,
        name: line.name,
        priceCents: line.unitPriceCents,
        image: imageByKey[line.key] ?? '',
        qty: line.qty,
      });
    }
    setReordered(true);
    router.push('/checkout');
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="card grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="flex flex-col gap-4">
          <p className="kicker">Your order</p>
          <h1 className="text-4xl font-bold text-navy sm:text-5xl">{order.displayNumber}</h1>
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold text-cream">
            <span className={`h-2.5 w-2.5 rounded-full ${cancelled ? 'bg-danger' : 'bg-ochre-bright'} ${TERMINAL.includes(order.status) ? '' : 'animate-pulse'}`} aria-hidden="true" />
            {STATUS_LABEL[order.status]}
          </p>
          <p className="text-[1.02rem] leading-relaxed">
            {awaiting
              ? 'We are waiting for your payment to be approved. This page updates automatically.'
              : cancelled
                ? 'This order was cancelled. If you were charged, our team will help you with a refund.'
                : order.status === 'collected'
                  ? 'Thank you for eating with us. We hope you enjoyed your meal.'
                  : order.status === 'ready'
                    ? 'Your order is ready. Please collect it at the counter.'
                    : 'We have your order and will keep you updated here. This page refreshes automatically.'}
          </p>
        </div>
        <dl className="grid gap-4 rounded-3xl bg-cream p-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{order.fulfilment === 'dine_in' ? 'Arrival' : 'Pickup'}</dt>
            <dd className="text-right font-semibold text-navy">
              {pickup ? `${pickupDate}, ${pickup}` : 'As soon as possible'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Ordered via</dt>
            <dd className="font-semibold text-navy">{CHANNEL_LABEL[order.channel]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Payment</dt>
            <dd className="text-right font-semibold text-navy">
              {PAYMENT_METHOD_LABEL[order.paymentMethod]}
              <span className="block text-xs font-medium text-muted">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</span>
            </dd>
          </div>
          {order.cardLast4 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Card</dt>
              <dd className="font-semibold text-navy">
                {order.cardBrand} ending {order.cardLast4} (demo)
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {!cancelled ? (
        <section aria-labelledby="progress-heading" className="card p-8 sm:p-10">
          <h2 id="progress-heading" className="sr-only">
            Order progress
          </h2>
          <ol className="grid gap-8 md:grid-cols-4">
            {TRACK_STEPS.map((step, index) => {
              const done = stepIndex >= index;
              const current = stepIndex === index;
              return (
                <li key={step.status} className="flex flex-col items-start gap-3" aria-current={current ? 'step' : undefined}>
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold ${
                      done ? 'border-navy bg-navy text-cream' : 'border-navy/20 bg-white text-muted'
                    } ${current ? 'ring-4 ring-ochre/30' : ''}`}
                  >
                    {done && index < stepIndex ? <Check className="h-5 w-5" aria-hidden="true" /> : index + 1}
                  </span>
                  <div>
                    <p className={`font-semibold ${done ? 'text-navy' : 'text-muted'}`}>{step.label}</p>
                    <p className="mt-1 text-sm">{step.hint}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="items-heading" className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-8">
          <h2 id="items-heading" className="font-display text-2xl font-bold text-navy">
            Items
          </h2>
          <ul className="mt-6 divide-y divide-navy/10">
            {order.lines.map((line) => (
              <li key={line.key} className="flex items-center gap-4 py-4">
                {imageByKey[line.key] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageByKey[line.key]} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" loading="lazy" />
                ) : (
                  <span className="h-16 w-16 shrink-0 rounded-2xl bg-navy/10" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy">{line.name}</p>
                  <p className="text-sm">
                    {line.qty} × {formatZAR(line.unitPriceCents, true)}
                  </p>
                </div>
                <p className="font-semibold text-navy">{formatZAR(line.lineTotalCents, true)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 grid gap-2 border-t border-navy/10 pt-5 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal (ex VAT)</dt>
              <dd>{formatZAR(order.subtotalCents, true)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>VAT at 15%</dt>
              <dd>{formatZAR(order.vatCents, true)}</dd>
            </div>
            <div className="flex justify-between pt-2 text-lg">
              <dt className="font-bold text-navy">Total</dt>
              <dd className="font-display text-2xl font-bold text-navy">{formatZAR(order.totalCents, true)}</dd>
            </div>
          </dl>
          {order.notes ? (
            <p className="mt-5 rounded-2xl bg-cream p-4 text-sm">
              <span className="font-semibold text-navy">Your notes:</span> {order.notes}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-8">
          <div className="card p-8">
            <h2 className="font-display text-2xl font-bold text-navy">Activity</h2>
            <ol className="mt-6 grid gap-4 border-l-2 border-ochre/40 pl-6">
              {order.events.map((event, i) => (
                <li key={`${event.at}-${i}`} className="relative">
                  <span aria-hidden="true" className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full bg-ochre" />
                  <p className="font-semibold text-navy">{STATUS_LABEL[event.status]}</p>
                  <p className="text-sm">{event.note}</p>
                  <p className="text-xs text-muted">{formatSAST(event.at)}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="card flex flex-col gap-3 p-8 no-print">
            <h2 className="font-display text-2xl font-bold text-navy">Need anything?</h2>
            <button type="button" onClick={orderAgain} className="btn btn-navy">
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              {reordered ? 'Opening checkout…' : 'Order again'}
            </button>
            <button type="button" onClick={() => window.print()} className="btn btn-outline">
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print receipt
            </button>
            <a href={waMessage} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask about this order on WhatsApp
            </a>
            <Link href="/menu" className="btn-quiet self-start">
              Back to the menu
            </Link>
            <p className="text-xs text-muted">
              {BRAND.name}, {BRAND.street}, {BRAND.suburb}. All prices include VAT.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
