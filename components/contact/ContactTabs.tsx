'use client';

import { useId, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Field } from '@/components/ui/Field';

type Topic = 'general' | 'event' | 'table' | 'lunch';

type FieldDef = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'time' | 'number' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
  full?: boolean;
  placeholder?: string;
  hint?: string;
};

const TOPICS: { id: Topic; label: string; intro: string; apiType: string; fields: FieldDef[] }[] = [
  {
    id: 'general',
    label: 'General enquiry',
    intro: 'Questions about the menu, opening hours, allergies or anything else.',
    apiType: 'contact',
    fields: [
      { name: 'name', label: 'Your name', required: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', hint: 'Or give a mobile number below.' },
      { name: 'phone', label: 'Mobile number', type: 'tel', placeholder: '082 123 4567' },
      { name: 'subject', label: 'What is it about?', type: 'select', options: ['General question', 'Order help', 'Menu or allergies', 'Feedback', 'Something else'] },
      { name: 'message', label: 'Your message', type: 'textarea', required: true, full: true, hint: 'At least 10 characters.' },
    ],
  },
  {
    id: 'event',
    label: 'Event enquiry',
    intro: 'Tell us about your event and we will confirm what we can offer, including menus and timings.',
    apiType: 'catering',
    fields: [
      { name: 'name', label: 'Your name', required: true },
      { name: 'phone', label: 'Mobile number', type: 'tel', required: true, placeholder: '082 123 4567' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
      { name: 'eventType', label: 'Type of event', type: 'select', options: ['Birthday', 'Family gathering', 'Heritage Day', 'Corporate event', 'Other'] },
      { name: 'eventDate', label: 'Event date', type: 'date', required: true },
      { name: 'guests', label: 'Number of guests', type: 'number', required: true, placeholder: 'For example 25' },
      { name: 'notes', label: 'Menu ideas and dietary needs', type: 'textarea', full: true },
    ],
  },
  {
    id: 'table',
    label: 'Book a table',
    intro: 'Request a table for dine-in. We confirm every booking by phone or WhatsApp.',
    apiType: 'table',
    fields: [
      { name: 'name', label: 'Name for the booking', required: true },
      { name: 'phone', label: 'Mobile number', type: 'tel', required: true, placeholder: '082 123 4567' },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time', type: 'time', required: true },
      { name: 'guests', label: 'Number of people', type: 'select', required: true, options: ['1', '2', '3', '4', '5', '6', '7', '8', '9-12', '13 or more'] },
      { name: 'occasion', label: 'Occasion (optional)', placeholder: 'Birthday, date night, lunch…' },
      { name: 'notes', label: 'Anything we should know?', type: 'textarea', full: true },
    ],
  },
  {
    id: 'lunch',
    label: 'Office lunch plan',
    intro: 'Feeding a team in Pretoria Central? Tell us what your office needs and we will get back to you.',
    apiType: 'lunch',
    fields: [
      { name: 'name', label: 'Your name', required: true },
      { name: 'company', label: 'Company or office', required: true },
      { name: 'email', label: 'Work email', type: 'email', placeholder: 'you@company.co.za' },
      { name: 'phone', label: 'Mobile number', type: 'tel', placeholder: '082 123 4567' },
      { name: 'people', label: 'Number of people', type: 'number', required: true, placeholder: 'For example 12' },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'days', label: 'Days needed', placeholder: 'For example Monday to Friday', full: true },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
  },
];

const TOP_LEVEL = new Set(['name', 'email', 'phone']);

function DynamicForm({ topic, initialValues }: { topic: (typeof TOPICS)[number]; initialValues: Record<string, string> }) {
  const formId = useId();
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');
    const payload: Record<string, unknown> = { type: topic.apiType, details: {} as Record<string, string> };
    const details: Record<string, string> = {};
    for (const field of topic.fields) {
      const value = (values[field.name] ?? '').trim();
      if (TOP_LEVEL.has(field.name)) payload[field.name] = value;
      else if (field.name === 'message') payload.message = value;
      else if (value) details[field.name] = value;
    }
    if (topic.id === 'general' && values.subject) details.subject = values.subject;
    payload.details = details;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; reference?: string };
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Please check the form and try again.');
        return;
      }
      setStatus('done');
      setReference(data.reference ?? '');
      setValues(initialValues);
      setConsent(false);
    } catch {
      setStatus('error');
      setMessage('We could not reach the server. Please try again.');
    }
  }

  if (status === 'done') {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-3xl bg-white p-8 shadow-soft">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
        <p className="font-display text-2xl font-bold text-navy">Thank you, we have your message</p>
        <p>
          Your reference is <span className="font-bold text-navy">{reference}</span>. Our team will reply by the email or
          mobile number you gave us.
        </p>
        <button type="button" onClick={() => setStatus('idle')} className="btn btn-outline btn-sm">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form id={formId} onSubmit={submit} noValidate className="grid gap-x-6 gap-y-5 md:grid-cols-2">
      {topic.fields.map((field) => {
        const id = `${formId}-${field.name}`;
        const value = values[field.name] ?? '';
        const common = {
          id,
          value,
          required: field.required,
          placeholder: field.placeholder,
          className: 'field',
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
          ) => set(field.name, e.target.value),
        };
        return (
          <div key={field.name} className={field.full ? 'md:col-span-2' : ''}>
            <Field id={id} label={`${field.label}${field.required ? ' *' : ''}`} hint={field.hint}>
              {field.type === 'select' ? (
                <select {...common} className="field">
                  <option value="">Choose one</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea {...common} rows={4} className="field" />
              ) : (
                <input {...common} type={field.type ?? 'text'} min={field.type === 'number' ? 1 : undefined} />
              )}
            </Field>
          </div>
        );
      })}
      <div className="md:col-span-2 flex flex-col gap-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#B77E23]"
            required
          />
          <span>I agree that Heritage Bites may contact me about this enquiry. See our privacy notice.</span>
        </label>
        {message ? (
          <p role="alert" className="error-text">
            {message}
          </p>
        ) : null}
        <div>
          <button type="submit" disabled={status === 'sending' || !consent} className="btn btn-navy">
            {status === 'sending' ? 'Sending…' : 'Send enquiry'}
          </button>
          {!consent ? <span className="ml-4 text-xs text-muted">Tick the box above to send.</span> : null}
        </div>
      </div>
    </form>
  );
}

export function ContactTabs({ defaultTopic }: { defaultTopic: Topic }) {
  const [active, setActive] = useState<Topic>(defaultTopic);
  const topic = TOPICS.find((t) => t.id === active) ?? TOPICS[0];
  const tabBase = useId();
  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label="Type of enquiry" className="flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            id={`${tabBase}-${t.id}`}
            role="tab"
            type="button"
            aria-selected={t.id === active}
            aria-controls={`${tabBase}-panel`}
            onClick={() => setActive(t.id)}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
              t.id === active ? 'border-navy bg-navy text-cream' : 'border-navy/15 bg-white text-navy hover:border-ochre'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id={`${tabBase}-panel`} role="tabpanel" aria-labelledby={`${tabBase}-${topic.id}`} className="card p-7 sm:p-10">
        <h2 className="font-display text-3xl font-bold text-navy">{topic.label}</h2>
        <p className="mb-8 mt-2">{topic.intro}</p>
        <DynamicForm key={topic.id} topic={topic} initialValues={{}} />
      </div>
    </div>
  );
}
