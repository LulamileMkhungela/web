'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Field } from '@/components/ui/Field';

export function StaffLogin() {
  const router = useRouter();
  const pinId = useId();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (pin.trim().length < 4) {
      setError('Enter your staff PIN (at least 4 digits).');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'That PIN is not correct.');
        setBusy(false);
        return;
      }
      router.replace('/staff');
      router.refresh();
    } catch {
      setError('We could not reach the server. Please try again.');
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-center gap-8 px-5 py-16">
      <div className="flex flex-col items-start gap-6">
        <Logo />
        <div>
          <p className="kicker">Staff console</p>
          <h1 className="mt-2 text-4xl font-bold text-navy">Sign in to manage orders</h1>
          <p className="mt-3">Use the staff PIN for this restaurant. The console is for kitchen and counter staff only.</p>
        </div>
      </div>
      <form onSubmit={submit} noValidate className="card flex flex-col gap-6 p-8">
        <Field id={pinId} label="Staff PIN" error={error || undefined} hint="The demo PIN is in the README. Change it before launch.">
          <input
            id={pinId}
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="field text-center text-xl tracking-[0.4em]"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${pinId}-error` : `${pinId}-hint`}
          />
        </Field>
        <button type="submit" disabled={busy} className="btn btn-navy w-full py-4">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" aria-hidden="true" /> Unlock console
            </>
          )}
        </button>
      </form>
    </main>
  );
}
