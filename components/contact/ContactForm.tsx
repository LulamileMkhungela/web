'use client';

import { useId, useState, type FormEvent } from 'react';
import { Field } from '@/components/ui/Field';

export type ContactTopic = 'general' | 'catering' | 'table';
type Topic = ContactTopic;

const TOPICS: { id: Topic; label: string }[] = [
  { id: 'general', label: 'General question or feedback' },
  { id: 'catering', label: 'Catering, an event or office lunches' },
  { id: 'table', label: 'Table booking' },
];

/**
 * One form for every enquiry. Extra fields appear only for catering and table bookings.
 * The home page opens it with a topic already chosen (initialTopic).
 */
export function ContactForm({ initialTopic = 'general' }: { initialTopic?: ContactTopic }) {
  const topicId = useId();
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const messageId = useId();
  const eventDateId = useId();
  const guestsId = useId();
  const bookDateId = useId();
  const bookTimeId = useId();
  const peopleId = useId();

  const [topic, setTopic] = useState<Topic>(initialTopic);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guests, setGuests] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [people, setPeople] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError('');
    const details: Record<string, string> =
      topic === 'catering'
        ? { eventDate, guests }
        : topic === 'table'
          ? { date: bookDate, time: bookTime, guests: people }
          : {};
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: topic === 'general' ? 'contact' : topic,
          name,
          phone,
          email,
          subject: TOPICS.find((t) => t.id === topic)?.label ?? '',
          message,
          details,
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
        <Field id={topicId} label="What is this about?" className="sm:col-span-2">
          <select id={topicId} className="field" value={topic} onChange={(event) => setTopic(event.target.value as Topic)}>
            {TOPICS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

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
        <Field
          id={phoneId}
          label="Cellphone"
          hint={topic === 'general' ? 'Add a cellphone or an email so we can reply.' : undefined}
        >
          <input
            id={phoneId}
            className="field"
            type="tel"
            maxLength={20}
            autoComplete="tel"
            required={topic !== 'general'}
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

        {topic === 'catering' ? (
          <>
            <Field id={eventDateId} label="Event date">
              <input
                id={eventDateId}
                className="field"
                type="date"
                required
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
              />
            </Field>
            <Field id={guestsId} label="Number of guests">
              <input
                id={guestsId}
                className="field"
                type="number"
                min={1}
                max={2000}
                required
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
              />
            </Field>
          </>
        ) : null}

        {topic === 'table' ? (
          <>
            <Field id={bookDateId} label="Date">
              <input
                id={bookDateId}
                className="field"
                type="date"
                required
                value={bookDate}
                onChange={(event) => setBookDate(event.target.value)}
              />
            </Field>
            <Field id={bookTimeId} label="Time">
              <input
                id={bookTimeId}
                className="field"
                type="time"
                required
                value={bookTime}
                onChange={(event) => setBookTime(event.target.value)}
              />
            </Field>
            <Field id={peopleId} label="Number of people" className="sm:col-span-2">
              <input
                id={peopleId}
                className="field"
                type="number"
                min={1}
                max={200}
                required
                value={people}
                onChange={(event) => setPeople(event.target.value)}
              />
            </Field>
          </>
        ) : null}

        <Field
          id={messageId}
          label={topic === 'general' ? 'Your message' : 'Anything else we should know (optional)'}
          className="sm:col-span-2"
        >
          <textarea
            id={messageId}
            className="field"
            rows={5}
            maxLength={2000}
            required={topic === 'general'}
            minLength={topic === 'general' ? 10 : undefined}
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
