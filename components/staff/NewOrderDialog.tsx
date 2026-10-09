'use client';

import { useId, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import { formatZAR } from '@/lib/money';
import type { MenuCategory } from '@/lib/types';

const CHANNELS = [
  { value: 'walk_in', label: 'Walk-in or counter' },
  { value: 'phone', label: 'Phone order' },
  { value: 'uber_eats', label: 'Uber Eats (log an app order)' },
  { value: 'mr_d', label: 'Mr D (log an app order)' },
];

export function NewOrderDialog({
  categories,
  onClose,
  onCreated,
}: {
  categories: MenuCategory[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const ids = useId();
  const [channel, setChannel] = useState('walk_in');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [externalRef, setExternalRef] = useState('');
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const items = useMemo(() => categories.flatMap((c) => c.items.map((i) => ({ ...i, category: c.name }))), [categories]);
  const visible = items.filter((i) => !filter || i.name.toLowerCase().includes(filter.toLowerCase()));
  const lines = Object.entries(qty).filter(([, n]) => n > 0);
  const total = lines.reduce((sum, [id, n]) => sum + (items.find((i) => i.id === id)?.priceCents ?? 0) * n, 0);
  const external = channel === 'uber_eats' || channel === 'mr_d';

  async function create() {
    setError('');
    if (name.trim().length < 2) {
      setError('Enter the customer name (or “Walk-in”).');
      return;
    }
    if (lines.length === 0) {
      setError('Add at least one dish.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/staff/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        channel,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        externalRef: external ? externalRef.trim() : '',
        notes: notes.trim(),
        lines: lines.map(([id, n]) => ({ key: `item:${id}`, qty: n })),
      }),
    });
    const data = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? 'Could not create the order.');
      return;
    }
    onCreated();
  }

  return (
    <div className="no-print fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-navy/70 p-4 sm:p-10" role="dialog" aria-modal="true" aria-labelledby={`${ids}-title`}>
      <div className="card relative flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="kicker">New order</p>
            <h2 id={`${ids}-title`} className="mt-1 text-3xl font-bold text-navy">
              Enter an order
            </h2>
            <p className="mt-2 text-sm">Use this for walk-ins, phone orders, and to log Uber Eats or Mr D orders so every order is in one place.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/15" aria-label="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field id={`${ids}-channel`} label="Where did it come from?">
            <select id={`${ids}-channel`} className="field" value={channel} onChange={(e) => setChannel(e.target.value)}>
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id={`${ids}-name`} label="Customer name">
            <input id={`${ids}-name`} className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Walk-in" />
          </Field>
          <Field id={`${ids}-phone`} label="Phone (optional)">
            <input id={`${ids}-phone`} className="field" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
          </Field>
          {external ? (
            <Field id={`${ids}-ref`} label="App order reference (optional)">
              <input id={`${ids}-ref`} className="field" value={externalRef} onChange={(e) => setExternalRef(e.target.value)} />
            </Field>
          ) : (
            <Field id={`${ids}-notes`} label="Notes (optional)">
              <input id={`${ids}-notes`} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          )}
          {external ? (
            <Field id={`${ids}-notes2`} label="Notes (optional)" className="md:col-span-2">
              <input id={`${ids}-notes2`} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-navy">Dishes</h3>
            <label className="sr-only" htmlFor={`${ids}-filter`}>
              Find a dish
            </label>
            <input id={`${ids}-filter`} type="search" className="field h-11 w-full rounded-full sm:w-72" placeholder="Find a dish" value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
          <ul className="grid max-h-80 gap-2 overflow-y-auto rounded-2xl bg-cream p-3 md:grid-cols-2">
            {visible.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-navy">{item.name}</span>
                  <span className="text-xs text-muted">
                    {formatZAR(item.priceCents)}
                    {item.available ? '' : ' · sold out'}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => setQty((q) => ({ ...q, [item.id]: Math.max(0, (q[item.id] ?? 0) - 1) }))}
                    className="h-9 w-9 rounded-full border border-navy/15 font-bold text-navy disabled:opacity-40"
                    aria-label={`Remove one ${item.name}`}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold" aria-live="polite">
                    {qty[item.id] ?? 0}
                  </span>
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => setQty((q) => ({ ...q, [item.id]: Math.min(40, (q[item.id] ?? 0) + 1) }))}
                    className="h-9 w-9 rounded-full bg-navy font-bold text-cream disabled:opacity-40"
                    aria-label={`Add one ${item.name}`}
                  >
                    +
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {error ? (
          <p role="alert" className="error-text">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-5">
          <p className="font-display text-2xl font-bold text-navy">
            Total {formatZAR(total, true)} <span className="font-sans text-sm font-normal text-muted">incl. VAT</span>
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="button" onClick={create} disabled={saving} className="btn btn-navy">
              {saving ? 'Saving…' : 'Create order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
