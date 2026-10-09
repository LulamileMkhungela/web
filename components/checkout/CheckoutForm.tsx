'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Banknote, CreditCard, Loader2, MessageCircle, ShieldCheck, Store } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { Field } from '@/components/ui/Field';
import { formatZAR } from '@/lib/money';
import { whatsappLink } from '@/lib/whatsapp';
import { BRAND, DEFAULT_STORE_LINKS } from '@/lib/config';

type Props = {
  pickupOptions: { value: string; label: string }[];
  isOpen: boolean;
  statusDetail: string;
  initialChannel: 'website' | 'whatsapp';
  cancelled: boolean;
  waNumber: string;
  etaMinutes: number;
  storeLinks: { ubereats: string; mrd: string };
};

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'notes' | 'pickup' | 'basket', string>>;
type Method = 'card' | 'yoco' | 'counter';

const DEMO_CARD = { number: '4242 4242 4242 4242', name: 'Demo Customer', expiry: '12/30', cvc: '123' };

function RadioCard({
  checked,
  onSelect,
  icon,
  title,
  body,
  name,
}: {
  checked: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  body: string;
  name: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={`${name}: ${title}`}
      onClick={onSelect}
      className={`flex h-full w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
        checked ? 'border-navy bg-white shadow-soft ring-2 ring-ochre/40' : 'border-navy/15 bg-white/60 hover:border-ochre'
      }`}
    >
      <span
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          checked ? 'bg-navy text-ochre-bright' : 'bg-navy/5 text-navy'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-navy">{title}</span>
        <span className="mt-1 block text-sm leading-snug">{body}</span>
      </span>
    </button>
  );
}

export function CheckoutForm({ pickupOptions, isOpen, statusDetail, initialChannel, cancelled, waNumber, etaMinutes, storeLinks }: Props) {
  const cart = useCart();
  const router = useRouter();
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const pickupId = useId();
  const notesId = useId();
  const cardNumberId = useId();
  const cardNameId = useId();
  const expiryId = useId();
  const cvcId = useId();

  const [channel, setChannel] = useState<'website' | 'whatsapp'>(initialChannel);
  const [fulfilment, setFulfilment] = useState<'collection' | 'dine_in'>('collection');
  const [pickup, setPickup] = useState(pickupOptions[0]?.value ?? '');
  const [method, setMethod] = useState<Method>('card');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [card, setCard] = useState(DEMO_CARD);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState<'idle' | 'processing' | 'sending'>('idle');
  const [whatsApp, setWhatsApp] = useState<{ url: string; redirect: string; ref: string } | null>(null);

  if (!cart.ready) {
    return <div className="card h-96 animate-pulse p-8" aria-hidden="true" />;
  }

  if (whatsApp) {
    return (
      <div className="card flex flex-col gap-6 p-8 sm:p-10" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-white">
          <MessageCircle className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <p className="kicker">Order saved</p>
          <h2 className="mt-2 text-3xl font-bold text-navy">Your order {whatsApp.ref} is in</h2>
          <p className="mt-3 leading-relaxed">
            Send the message below on WhatsApp so our team can confirm your order and payment. You can also follow the
            order status on your tracking page.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={whatsApp.url} target="_blank" rel="noopener noreferrer" className="btn btn-navy">
            Open WhatsApp (new tab)
          </a>
          <Link href={whatsApp.redirect} className="btn btn-outline">
            Track my order
          </Link>
        </div>
      </div>
    );
  }

  const isWhatsApp = channel === 'whatsapp';
  const canSubmit = cart.lines.length > 0 && pickup !== '' && busy === 'idle';
  const payLabel = `Pay ${formatZAR(cart.totalCents, true)}`;

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Please enter your name';
    const digits = phone.replace(/[\s()-]/g, '');
    if (!/^\+?\d{9,15}$/.test(digits)) next.phone = 'Enter a valid mobile number, for example 082 123 4567';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = 'Enter a valid email address';
    if (notes.length > 300) next.notes = 'Notes must be 300 characters or fewer';
    if (!pickup) next.pickup = 'Choose a pickup time';
    if (cart.lines.length === 0) next.basket = 'Your basket is empty';
    return next;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError('Please check the highlighted fields.');
      return;
    }
    const cardPayment = !isWhatsApp && method === 'card';
    setBusy(cardPayment ? 'processing' : 'sending');
    if (cardPayment) await new Promise((resolve) => setTimeout(resolve, 1400));

    const payload = {
      channel: isWhatsApp ? 'whatsapp' : 'website',
      fulfilment,
      pickup,
      customer: { name: name.trim(), phone: phone.trim(), email: email.trim() },
      notes: notes.trim(),
      lines: cart.lines.map((line) => ({ key: line.key, qty: line.qty })),
      expectedTotalCents: cart.totalCents,
      payment: { method: isWhatsApp ? 'counter' : method, card: cardPayment ? card : undefined },
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        redirectUrl?: string;
        whatsappUrl?: string | null;
        displayNumber?: string;
      };
      if (!res.ok || !data.redirectUrl) {
        setFormError(data.error ?? 'We could not place your order. Please try again.');
        setBusy('idle');
        return;
      }
      if (isWhatsApp && data.whatsappUrl) {
        cart.clear();
        setWhatsApp({ url: data.whatsappUrl, redirect: data.redirectUrl, ref: data.displayNumber ?? '' });
        setBusy('idle');
        return;
      }
      if (method !== 'yoco') cart.clear();
      router.push(data.redirectUrl);
    } catch {
      setFormError('We could not reach the server. Check your connection and try again.');
      setBusy('idle');
    }
  }

  return (
    <form id="checkout-form" onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">
      <div className="flex flex-col gap-10">
        {cancelled ? (
          <div role="status" className="rounded-2xl border border-ochre/40 bg-ochre-wash px-5 py-4 text-sm font-semibold text-navy">
            Your payment was cancelled. Your basket is still here, so you can try again when you are ready.
          </div>
        ) : null}
        {formError ? (
          <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/5 px-5 py-4 text-sm font-semibold text-danger">
            {formError}
          </div>
        ) : null}
        {!isOpen ? (
          <div role="status" className="rounded-2xl border border-navy/15 bg-white px-5 py-4 text-sm text-navy">
            <span className="font-semibold">We are closed right now.</span> {statusDetail}. You can still schedule a
            pickup for when we open.
          </div>
        ) : null}

        <fieldset className="flex flex-col gap-5">
          <legend className="mb-2 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-navy">1. How would you like to order?</span>
          </legend>
          <div role="radiogroup" aria-label="Ordering channel" className="grid gap-4 md:grid-cols-2">
            <RadioCard
              name="Ordering channel"
              checked={!isWhatsApp}
              onSelect={() => setChannel('website')}
              icon={<Store className="h-5 w-5" aria-hidden="true" />}
              title="Order on this website"
              body="Pay online by debit card or Yoco, or pay at the counter."
            />
            <RadioCard
              name="Ordering channel"
              checked={isWhatsApp}
              onSelect={() => setChannel('whatsapp')}
              icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
              title="Send on WhatsApp"
              body="We confirm your order and payment by WhatsApp chat."
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="mb-2 font-display text-3xl font-bold text-navy">2. Your details</legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field id={nameId} label="Full name" error={errors.name}>
              <input
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="field"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${nameId}-error` : undefined}
              />
            </Field>
            <Field id={phoneId} label="Mobile number" error={errors.phone} hint="We call or WhatsApp you only about this order.">
              <input
                id={phoneId}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                inputMode="tel"
                placeholder="082 123 4567"
                className="field"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? `${phoneId}-error` : `${phoneId}-hint`}
              />
            </Field>
          </div>
          <Field id={emailId} label="Email (optional)" error={errors.email} hint="For your receipt.">
            <input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="field"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${emailId}-error` : `${emailId}-hint`}
            />
          </Field>
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="mb-2 font-display text-3xl font-bold text-navy">3. Collection and timing</legend>
          <div role="radiogroup" aria-label="Fulfilment" className="grid gap-4 md:grid-cols-2">
            <RadioCard
              name="Fulfilment"
              checked={fulfilment === 'collection'}
              onSelect={() => setFulfilment('collection')}
              icon={<Store className="h-5 w-5" aria-hidden="true" />}
              title="Collection"
              body={`Pick up at ${BRAND.street}, ${BRAND.suburb}.`}
            />
            <RadioCard
              name="Fulfilment"
              checked={fulfilment === 'dine_in'}
              onSelect={() => setFulfilment('dine_in')}
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
              title="Dine-in"
              body="Eat with us. We seat you when your order is ready."
            />
          </div>
          <Field
            id={pickupId}
            label={fulfilment === 'dine_in' ? 'Arrival time' : 'Pickup time'}
            error={errors.pickup}
            hint={`Ready in about ${etaMinutes} minutes for “as soon as possible”. Times are within our opening hours.`}
          >
            <select
              id={pickupId}
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="field"
              disabled={pickupOptions.length === 0}
              aria-invalid={Boolean(errors.pickup)}
            >
              {pickupOptions.length === 0 ? <option value="">No pickup times are available right now</option> : null}
              {pickupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id={notesId} label="Notes for the kitchen (optional)" error={errors.notes} hint="Allergies, spice level or anything we should know.">
            <textarea
              id={notesId}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={400}
              className="field"
              rows={3}
              aria-invalid={Boolean(errors.notes)}
            />
          </Field>
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="mb-2 font-display text-3xl font-bold text-navy">4. Payment</legend>
          {isWhatsApp ? (
            <p className="rounded-2xl border border-navy/10 bg-white p-5 text-sm leading-relaxed">
              You will agree payment with us on WhatsApp. Pay at the counter when you collect, or as we confirm.
            </p>
          ) : (
            <>
              <div role="radiogroup" aria-label="Payment method" className="grid gap-4 md:grid-cols-3">
                <RadioCard
                  name="Payment method"
                  checked={method === 'card'}
                  onSelect={() => setMethod('card')}
                  icon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
                  title="Debit card"
                  body="Demo processing. Nothing is charged."
                />
                <RadioCard
                  name="Payment method"
                  checked={method === 'yoco'}
                  onSelect={() => setMethod('yoco')}
                  icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
                  title="Yoco"
                  body="Secure hosted checkout (simulated)."
                />
                <RadioCard
                  name="Payment method"
                  checked={method === 'counter'}
                  onSelect={() => setMethod('counter')}
                  icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
                  title="Pay at counter"
                  body="Pay when you collect or sit down."
                />
              </div>

              {method === 'card' ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <p className="md:col-span-2 rounded-xl bg-ochre-wash px-4 py-3 text-sm font-semibold text-navy">
                    Demo mode: any card details are accepted and nothing is charged. Card numbers, expiry and CVC are
                    never stored. Only the card brand and last four digits are kept for receipts.
                  </p>
                  <Field id={cardNumberId} label="Card number" className="md:col-span-2">
                    <input
                      id={cardNumberId}
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className="field tracking-wider"
                    />
                  </Field>
                  <Field id={cardNameId} label="Name on card" className="md:col-span-2">
                    <input
                      id={cardNameId}
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      autoComplete="cc-name"
                      className="field"
                    />
                  </Field>
                  <Field id={expiryId} label="Expiry (MM/YY)">
                    <input
                      id={expiryId}
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      className="field"
                    />
                  </Field>
                  <Field id={cvcId} label="CVC">
                    <input
                      id={cvcId}
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      className="field"
                    />
                  </Field>
                </div>
              ) : null}

              {method === 'yoco' ? (
                <p className="rounded-2xl border border-navy/10 bg-white p-5 text-sm leading-relaxed">
                  You will be taken to a Yoco-style secure checkout page to approve the payment. This build simulates
                  it: nothing is charged.
                </p>
              ) : null}
              {method === 'counter' ? (
                <p className="rounded-2xl border border-navy/10 bg-white p-5 text-sm leading-relaxed">
                  Your order is sent to the kitchen straight away. Pay at the counter when you collect your meal.
                </p>
              ) : null}
            </>
          )}
        </fieldset>
      </div>

      <aside aria-labelledby="summary-title" className="card sticky top-44 flex flex-col gap-5 p-7">
        <div className="flex items-center justify-between">
          <h2 id="summary-title" className="font-display text-2xl font-bold text-navy">
            Your order
          </h2>
          <Link href="/menu" className="btn-quiet text-sm">
            Add more
          </Link>
        </div>
        {cart.lines.length === 0 ? (
          <div className="rounded-2xl bg-cream p-5 text-sm">
            <p className="font-semibold text-navy">Your basket is empty.</p>
            <p className="mt-1">Add a few dishes from the menu to continue.</p>
            <Link href="/menu" className="btn btn-navy btn-sm mt-4">
              Browse the menu
            </Link>
          </div>
        ) : (
          <ul className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
            {cart.lines.map((line) => (
              <li key={line.key} className="flex items-start justify-between gap-4 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold text-navy">
                    {line.qty} × {line.name}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-navy">{formatZAR(line.priceCents * line.qty)}</span>
              </li>
            ))}
          </ul>
        )}
        {errors.basket ? <p className="error-text">{errors.basket}</p> : null}
        <dl className="grid gap-2 border-t border-navy/10 pt-5 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal (ex VAT)</dt>
            <dd>{formatZAR(cart.totalCents - cart.vatCents, true)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>VAT at 15%</dt>
            <dd>{formatZAR(cart.vatCents, true)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-lg">
            <dt className="font-bold text-navy">Total</dt>
            <dd className="font-display text-2xl font-bold text-navy">{formatZAR(cart.totalCents, true)}</dd>
          </div>
        </dl>
        <button type="submit" disabled={!canSubmit} className="btn btn-ochre w-full py-4 text-base">
          {busy === 'processing' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Processing payment (demo)…
            </>
          ) : busy === 'sending' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Sending your order…
            </>
          ) : isWhatsApp ? (
            'Send order on WhatsApp'
          ) : method === 'counter' ? (
            'Place order'
          ) : (
            payLabel
          )}
        </button>
        {!isOpen ? <p className="text-xs text-muted">We are closed right now, so pickup times are for when we open.</p> : null}
        <div className="grid gap-2 rounded-2xl bg-cream p-4 text-xs leading-relaxed">
          <p className="font-semibold text-navy">Prefer delivery?</p>
          <p>
            Delivery is through{' '}
            <a href={storeLinks.ubereats || DEFAULT_STORE_LINKS.ubereats} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-4">
              Uber Eats
            </a>{' '}
            or{' '}
            <a href={storeLinks.mrd || DEFAULT_STORE_LINKS.mrd} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-4">
              Mr D
            </a>{' '}
            (both open in a new tab). Add the same dishes there.
          </p>
          <a
            href={whatsappLink(undefined, waNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-navy underline underline-offset-4"
          >
            Questions? WhatsApp us (opens in new tab)
          </a>
        </div>
      </aside>
    </form>
  );
}
