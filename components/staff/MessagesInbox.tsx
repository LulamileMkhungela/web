'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatSAST } from '@/lib/time';
import type { MessageType, MessageView } from '@/lib/types';

const TYPE_LABEL: Record<MessageType, string> = {
  contact: 'General enquiry',
  catering: 'Event enquiry',
  table: 'Table booking',
  lunch: 'Office lunch',
  subscribe: 'Specials list',
};

const DETAIL_LABEL: Record<string, string> = {
  eventType: 'Event type',
  eventDate: 'Event date',
  guests: 'Guests',
  date: 'Date',
  time: 'Time',
  occasion: 'Occasion',
  company: 'Company',
  people: 'People',
  days: 'Days',
  startDate: 'Start date',
  subject: 'Subject',
  notes: 'Notes',
};

export function MessagesInbox({ messages }: { messages: MessageView[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'new' | 'handled'>('new');
  const shown = messages.filter((m) => filter === 'all' || m.status === filter);

  async function setStatus(id: string, status: 'new' | 'handled') {
    await fetch(`/api/staff/messages/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <section aria-labelledby="inbox-heading" className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Enquiries</p>
          <h1 id="inbox-heading" className="mt-1 text-4xl font-bold text-navy">
            Contact form messages and specials sign-ups
          </h1>
        </div>
        <div role="tablist" aria-label="Filter enquiries" className="flex gap-2">
          {(['new', 'handled', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                filter === f ? 'border-navy bg-navy text-cream' : 'border-navy/15 bg-white text-navy'
              }`}
            >
              {f === 'new' ? 'To handle' : f === 'handled' ? 'Handled' : 'All'}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="card p-8 text-center">Nothing to show here.</p>
      ) : (
        <ul className="grid gap-5">
          {shown.map((m) => (
            <li key={m.id} className="card flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ochre-deep">{TYPE_LABEL[m.type]}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-navy">{m.name || 'Website visitor'}</p>
                  <p className="text-sm">
                    {[m.phone, m.email].filter(Boolean).join(' · ') || 'No contact details given'}
                  </p>
                </div>
                <div className="text-right text-xs text-muted">
                  <p>{formatSAST(m.createdAt, { weekday: 'short', day: 'numeric', month: 'short' })} {formatSAST(m.createdAt)}</p>
                  <p>Ref {m.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              {Object.keys(m.details).length > 0 ? (
                <dl className="grid gap-x-6 gap-y-2 rounded-2xl bg-cream p-4 text-sm sm:grid-cols-2">
                  {Object.entries(m.details).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <dt className="text-xs font-bold uppercase tracking-wide text-muted">{DETAIL_LABEL[key] ?? key}</dt>
                      <dd className="font-semibold text-navy">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {m.body ? <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p> : null}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatus(m.id, m.status === 'new' ? 'handled' : 'new')}
                  className="btn btn-outline btn-sm"
                >
                  {m.status === 'new' ? 'Mark as handled' : 'Mark as to do'}
                </button>
                {m.phone ? (
                  <a href={`tel:${m.phone.replace(/\s/g, '')}`} className="btn btn-navy btn-sm">
                    Call
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
