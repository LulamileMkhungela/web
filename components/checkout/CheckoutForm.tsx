'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { Field } from '@/components/ui/Field';
import { formatZAR } from '@/lib/money';

type PickupOption = { value: string; label: string };
type Method = 'card' | 'yoco' | 'counter' | 'whatsapp';
type Confirmation = { token: string; displayNumber: string; whatsappUrl: string | null };

type Props = {
  pickupOptions: PickupOption[];
  isOpen: boolean;
  statusDetail: string;
  initialChannel: 'website' | 'whatsapp';
  cancelled: boolean;
  etaMinutes: number;
  storeLinks: { ubereats: string; mrd: string };
};

const METHODS: { id: Method; title: string; body: string }[] = [
  { id: 'card', title: 'Debit card', body: 'Test payment: any card details are accepted and nothing is charged.' },
  { id: 'yoco', title: 'Yoco', body: 'Approve a test payment on a Yoco checkout page.' },
  { id: 'counter', title: 'Pay at the counter', body: 'Pay when you collect your order.' },
  { id: 'whatsapp', title: 'WhatsApp', body: 'We confirm your order and how you pay with you on WhatsApp.' },
];

/** One page: details, collection time, payment, then place the order. */
export function CheckoutForm({
  pickupOptions,
  isOpen,
  statusDetail,
  initialChannel,
  cancelled,
  etaMinutes,
  storeLinks,
}: Props) {
  const router = useRouter();
  const cart = useCart();
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const pickupId = useId();
  const notesId = useId();
  const cardNumberId = useId();
  const cardNameId = useId();
  const expiryId = useId();
  const cvcId = useId();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [pickup, setPickup] = useState(pickupOptions[0]?.value ?? '');
  const [method, setMethod] = useState<Method>(initialChannel === 'whatsapp' ? 'whatsapp' : 'card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !cart.ready || cart.lines.length === 0 || !pickup) return;
    setFormError(null);
    setSubmitting(true);
    const payload = {
      channel: method === 'whatsapp' ? 'whatsapp' : 'website',
      fulfilment: 'collection',
      pickup,
      customer: { name, phone, email },
      notes,
      lines: cart.lines.map((line) => ({ key: line.key, qty: line.qty })),
      expectedTotalCents: cart.totalCents,
      payment: method === 'card' ? { method: 'card', card } : { method: method === 'yoco' ? 'yoco' : 'counter' },
    };
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        token?: string;
        displayNumber?: string;
        redirectUrl?: string;
        whatsappUrl?: string | null;
      };
      if (!res.ok || !data.token) {
        setFormError(data.error ?? 'We could not place your order. Please check your details and try again.');
        setSubmitting(false);
        return;
      }
      cart.clear();
      if (method === 'whatsapp') {
        setConfirmation({ token: data.token, displayNumber: data.displayNumber ?? '', whatsappUrl: data.whatsappUrl ?? null });
        setSubmitting(false);
        return;
      }
      setRedirecting(true);
      router.push(data.redirectUrl ?? `/order/${data.token}`);
    } catch {
      setFormError('We could not reach the server. Check your connection and try again.');
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="card mx-auto max-w-2xl p-8 text-center sm:p-10">
        <p className="kicker">Order saved</p>
        <h2 className="mt-3 text-3xl font-bold">Order {confirmation.displayNumber} is saved</h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed">
          Tap the button to send it to us on WhatsApp. We will confirm your collection time and payment there.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {confirmation.whatsappUrl ? (
            <a href={confirmation.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
              Send on WhatsApp
            </a>
          ) : null}
          <Link href={`/order/${confirmation.token}`} className="btn btn-outline btn-lg">
            Track my order
          </Link>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-xl font-semibold text-navy">Taking you to the next step…</p>
      </div>
    );
  }

  if (!cart.ready) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-xl font-semibold text-navy">Loading your cart…</p>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center sm:p-10">
        <p className="text-2xl font-bold">Your cart is empty</p>
        <p className="mt-3">Choose a dish from the menu and it will appear here.</p>
        <Link href="/menu" className="btn btn-primary mt-7">
          Browse the menu
        </Link>
      </div>
    );
  }

  const total = cart.totalCents;
  const submitLabel = submitting
    ? 'Placing your order…'
    : method === 'whatsapp'
      ? `Continue on WhatsApp · ${formatZAR(total)}`
      : method === 'yoco'
        ? `Continue to Yoco · ${formatZAR(total)}`
        : `Place order · ${formatZAR(total)}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <aside className="card order-1 p-6 sm:p-7 lg:sticky lg:top-28 lg:order-2">
        <h2 className="text-2xl font-bold">Your order</h2>
        <ul className="mt-5 divide-y divide-line">
          {cart.lines.map((line) => (
            <li key={line.key} className="flex items-start justify-between gap-4 py-3">
              <span className="leading-snug">
                <span className="font-semibold text-navy">{line.qty} ×</span> {line.name}
              </span>
              <span className="shrink-0 font-semibold text-navy">{formatZAR(line.priceCents * line.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Of which VAT (15%)</dt>
            <dd>{formatZAR(cart.vatCents)}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-lg font-semibold text-navy">Total incl. VAT</span>
          <span className="text-2xl font-bold text-navy">{formatZAR(total)}</span>
        </div>
        <Link href="/menu" className="mt-4 inline-block text-sm font-semibold text-navy underline underline-offset-4">
          Add more dishes
        </Link>

        <div className="mt-6 rounded-2xl bg-cream p-5">
          <p className="font-semibold text-navy">Prefer delivery?</p>
          <p className="mt-1 text-sm">Order the same meals for delivery on these apps.</p>
          <div className="mt-4 grid gap-3">
            <a href={storeLinks.ubereats} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block btn-sm">
              Order on Uber Eats
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={storeLinks.mrd} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block btn-sm">
              Order on Mr D
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </aside>

      <form onSubmit={placeOrder} className="order-2 flex flex-col gap-6 lg:order-1">
        {cancelled ? (
          <div role="status" className="rounded-2xl bg-ochre-wash p-5 text-navy">
            Your Yoco payment was cancelled. Your order was not placed, and your cart is still saved. Choose a payment
            method to try again.
          </div>
        ) : null}

        <section className="card p-6 sm:p-7" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-2xl font-bold">
            Your details
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field id={nameId} label="Full name">
              <input
                id={nameId}
                className="field"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field id={phoneId} label="Cellphone" hint="So we can call or WhatsApp you about this order.">
              <input
                id={phoneId}
                className="field"
                type="tel"
                required
                maxLength={20}
                autoComplete="tel"
                placeholder="082 123 4567"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </Field>
            <Field id={emailId} label="Email (optional)" hint="For your receipt." className="sm:col-span-2">
              <input
                id={emailId}
                className="field"
                type="email"
                maxLength={120}
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field id={notesId} label="Notes for the kitchen (optional)" hint="Allergies, spice level or anything we should know." className="sm:col-span-2">
              <textarea
                id={notesId}
                className="field"
                rows={2}
                maxLength={300}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="card p-6 sm:p-7" aria-labelledby="collection-heading">
          <h2 id="collection-heading" className="text-2xl font-bold">
            Collection time
          </h2>
          <div className="mt-6">
            <Field
              id={pickupId}
              label="When would you like to collect?"
              hint={
                isOpen
                  ? `We are open now. Choose “As soon as possible” and your order is ready in about ${etaMinutes} minutes.`
                  : `We are closed right now (${statusDetail}). Choose a later time.`
              }
            >
              <select
                id={pickupId}
                className="field"
                required
                disabled={pickupOptions.length === 0}
                value={pickup}
                onChange={(event) => setPickup(event.target.value)}
              >
                {pickupOptions.length === 0 ? (
                  <option value="">No collection times are available right now</option>
                ) : (
                  pickupOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                )}
              </select>
            </Field>
          </div>
        </section>

        <section className="card p-6 sm:p-7" aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="text-2xl font-bold">
            How would you like to pay?
          </h2>
          <fieldset className="mt-6 grid gap-3">
            <legend className="sr-only">Payment method</legend>
            {METHODS.map((option) => {
              const selected = method === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex min-h-16 cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                    selected ? 'border-navy bg-cream' : 'border-line bg-white hover:border-navy/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={selected}
                    onChange={() => setMethod(option.id)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#001938]"
                  />
                  <span>
                    <span className="block font-semibold text-navy">{option.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed">{option.body}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          {method === 'card' ? (
            <div className="mt-5 grid gap-5 rounded-2xl bg-cream p-5 sm:grid-cols-2">
              <p className="text-sm sm:col-span-2">
                Test payment: you can type anything here. Nothing is charged or stored.
              </p>
              <Field id={cardNumberId} label="Card number" className="sm:col-span-2">
                <input
                  id={cardNumberId}
                  className="field"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  maxLength={40}
                  value={card.number}
                  onChange={(event) => setCard({ ...card, number: event.target.value })}
                />
              </Field>
              <Field id={cardNameId} label="Name on card" className="sm:col-span-2">
                <input
                  id={cardNameId}
                  className="field"
                  autoComplete="cc-name"
                  maxLength={80}
                  value={card.name}
                  onChange={(event) => setCard({ ...card, name: event.target.value })}
                />
              </Field>
              <Field id={expiryId} label="Expiry (MM/YY)">
                <input
                  id={expiryId}
                  className="field"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  maxLength={10}
                  value={card.expiry}
                  onChange={(event) => setCard({ ...card, expiry: event.target.value })}
                />
              </Field>
              <Field id={cvcId} label="CVC">
                <input
                  id={cvcId}
                  className="field"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={6}
                  value={card.cvc}
                  onChange={(event) => setCard({ ...card, cvc: event.target.value })}
                />
              </Field>
            </div>
          ) : null}
        </section>

        {formError ? (
          <div role="alert" className="rounded-2xl border border-danger/30 bg-white p-4 font-medium text-danger">
            {formError}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={submitting || pickupOptions.length === 0}
          >
            {submitLabel}
          </button>
          <p className="text-center text-sm">
            By placing your order you agree to our{' '}
            <Link href="/terms" className="font-semibold text-navy underline underline-offset-4">
              terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-semibold text-navy underline underline-offset-4">
              privacy notice
            </Link>
            .
          </p>
        </div>
      </form>
    </div>
  );
}
