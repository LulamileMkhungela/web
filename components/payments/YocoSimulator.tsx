'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { writeCart } from '@/lib/cart';
import { Field } from '@/components/ui/Field';

export function YocoSimulator({
  checkoutId,
  status,
  amountLabel,
}: {
  checkoutId: string;
  status: string;
  amountLabel: string;
}) {
  const router = useRouter();
  const numberId = useId();
  const nameId = useId();
  const expiryId = useId();
  const cvcId = useId();
  const [busy, setBusy] = useState<'idle' | 'approve' | 'cancel'>('idle');
  const [error, setError] = useState('');
  const finished = status !== 'pending';

  async function act(action: 'approve' | 'cancel') {
    setBusy(action);
    setError('');
    try {
      const res = await fetch(`/api/payments/yoco/${checkoutId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { error?: string; redirectUrl?: string };
      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? 'This payment could not be completed. Please try again.');
        setBusy('idle');
        return;
      }
      if (action === 'approve') writeCart([]);
      router.push(data.redirectUrl);
    } catch {
      setError('We could not reach the server. Please try again.');
      setBusy('idle');
    }
  }

  if (finished) {
    return (
      <section className="card flex flex-col gap-5 p-8">
        <p className="text-lg font-semibold text-navy">This checkout session is already complete.</p>
        <Link href="/menu" className="btn btn-navy self-start">
          Back to the menu
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="yoco-pay-title" className="card flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 id="yoco-pay-title" className="font-display text-2xl font-bold text-navy">
          Card details
        </h1>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
          <Lock className="h-4 w-4" aria-hidden="true" /> Simulated
        </span>
      </div>
      <div className="grid gap-5">
        <Field id={numberId} label="Card number">
          <input id={numberId} defaultValue="4242 4242 4242 4242" inputMode="numeric" className="field tracking-wider" />
        </Field>
        <Field id={nameId} label="Name on card">
          <input id={nameId} defaultValue="Demo Customer" className="field" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={expiryId} label="Expiry (MM/YY)">
            <input id={expiryId} defaultValue="12/30" inputMode="numeric" className="field" />
          </Field>
          <Field id={cvcId} label="CVC">
            <input id={cvcId} defaultValue="123" inputMode="numeric" className="field" />
          </Field>
        </div>
      </div>
      {error ? (
        <p role="alert" className="error-text">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3">
        <button type="button" onClick={() => act('approve')} disabled={busy !== 'idle'} className="btn btn-ochre w-full py-4 text-base">
          {busy === 'approve' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Approving…
            </>
          ) : (
            `Pay ${amountLabel}`
          )}
        </button>
        <button type="button" onClick={() => act('cancel')} disabled={busy !== 'idle'} className="btn btn-outline w-full">
          {busy === 'cancel' ? 'Cancelling…' : 'Cancel and return to checkout'}
        </button>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        Demo only. Any details are accepted, and nothing is charged or stored.
      </p>
    </section>
  );
}
