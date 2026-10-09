'use client';

import { useId, useState, type FormEvent } from 'react';
import { Field } from '@/components/ui/Field';

const SUBJECT = 'General question or feedback';

/** One contact form for questions, feedback and order queries. It goes to the staff inbox as a general message. */
export function ContactForm() {
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const messageId = useId();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          name,
          phone,
          email,
          subject: SUBJECT,
          message,
          details: {},
          consent: false,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; reference?: string };
      if (!res.ok) {
        setError(data.error ?? 'Please check the form and try again.');
        setStatus('error');
        return;
      }
      setReference(data.reference ?? '');
      setStatus('sent');
    } catch {
      setError('We could not send your message. Check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    const firstName = name.trim().split(' ')[0] || 'there';
    return (
      <div className="card flex flex-col gap-4 p-8 sm:p-10">
        <p className="kicker">Message sent</p>
        <h2 className="text-3xl font-bold">Thank you, {firstName}</h2>
        <p className="leading-relaxed">
          Your reference is <strong className="text-navy">{reference}</strong>. We will reply on the email or cellphone
          you gave us.
        </p>
        <div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setStatus('idle');
              setMessage('');
            }}
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-6 p-6 sm:p-8" aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading" className="text-2xl font-bold">
        Send us a message
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={nameId} label="Your name">
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
        <Field id={phoneId} label="Cellphone" hint="Add a cellphone or an email so we can reply.">
          <input
            id={phoneId}
            className="field"
            type="tel"
            maxLength={20}
            autoComplete="tel"
            placeholder="082 123 4567"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </Field>
        <Field id={emailId} label="Email (optional)" className="sm:col-span-2">
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
        <Field id={messageId} label="Your message" className="sm:col-span-2">
          <textarea
            id={messageId}
            className="field"
            rows={5}
            maxLength={2000}
            required
            minLength={10}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>
      </div>

      {status === 'error' ? (
        <p role="alert" className="rounded-2xl border border-danger/30 bg-white p-4 font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p className="hint">We use your details only to reply to you.</p>
      </div>
    </form>
  );
}
