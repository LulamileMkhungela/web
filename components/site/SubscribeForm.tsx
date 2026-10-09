'use client';

import { useId, useState } from 'react';
import { Field } from '@/components/ui/Field';

export function SubscribeForm({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const emailId = useId();
  const consentId = useId();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'subscribe', email, consent }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setStatus('done');
      setMessage('Thank you. We will send the weekly specials to that address.');
      setEmail('');
      setConsent(false);
    } catch {
      setStatus('error');
      setMessage('We could not reach the server. Please try again.');
    }
  }

  const dark = variant === 'dark';
  return (
    <form onSubmit={submit} noValidate className="flex w-full flex-col gap-3" aria-label="Subscribe to weekly specials">
      <Field id={emailId} label="Get the weekly specials by email" error={undefined} tone={dark ? 'dark' : 'light'}>
        <div className="flex flex-col gap-2">
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`field min-w-0 flex-1 ${dark ? 'bg-white' : ''}`}
            aria-describedby={`${emailId}-note`}
          />
          <button type="submit" className="btn btn-ochre w-full" disabled={status === 'sending'}>
            {status === 'sending' ? 'Saving…' : 'Subscribe'}
          </button>
        </div>
      </Field>
      <label htmlFor={consentId} className={`flex items-start gap-3 text-sm ${dark ? 'text-cream/80' : 'text-body'}`}>
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#B77E23]"
        />
        <span>I agree that Heritage Bites may send me specials and news. I can unsubscribe at any time.</span>
      </label>
      <p id={`${emailId}-note`} className={`text-xs ${dark ? 'text-cream/60' : 'text-muted'}`}>
        Your details are used only for specials. See our privacy notice.
      </p>
      {message ? (
        <p role="status" className={`text-sm font-semibold ${status === 'error' ? 'text-[#f1b9a9]' : 'text-ochre-bright'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
