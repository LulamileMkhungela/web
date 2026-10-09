'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import { LONG_DAYS } from '@/lib/config';
import { formatZAR } from '@/lib/money';
import type { MenuCategory, SpecialView } from '@/lib/types';

type Draft = {
  title: string;
  description: string;
  itemId: string;
  price: string;
  weekday: string;
  windowStart: string;
  windowEnd: string;
};

const EMPTY: Draft = { title: '', description: '', itemId: '', price: '', weekday: 'any', windowStart: '', windowEnd: '' };

function toPayload(d: Draft) {
  const rands = Number(d.price);
  return {
    title: d.title.trim(),
    description: d.description.trim(),
    itemId: d.itemId || null,
    priceCents: d.price && Number.isFinite(rands) ? Math.round(rands * 100) : null,
    weekday: d.weekday === 'any' ? null : Number(d.weekday),
    windowStart: d.windowStart || null,
    windowEnd: d.windowEnd || null,
  };
}

function SpecialFields({ draft, setDraft, items, idPrefix }: { draft: Draft; setDraft: (d: Draft) => void; items: { id: string; name: string }[]; idPrefix: string }) {
  const set = (key: keyof Draft, value: string) => setDraft({ ...draft, [key]: value });
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Field id={`${idPrefix}-title`} label="Special name">
        <input id={`${idPrefix}-title`} className="field" value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Mogodu Monday" />
      </Field>
      <Field id={`${idPrefix}-item`} label="Dish">
        <select id={`${idPrefix}-item`} className="field" value={draft.itemId} onChange={(e) => set('itemId', e.target.value)}>
          <option value="">Choose a dish</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${idPrefix}-price`} label="Special price (R)" hint="Leave blank to use the dish price.">
        <input
          id={`${idPrefix}-price`}
          type="number"
          min={1}
          step="0.50"
          inputMode="decimal"
          className="field"
          value={draft.price}
          onChange={(e) => set('price', e.target.value)}
        />
      </Field>
      <Field id={`${idPrefix}-day`} label="Day">
        <select id={`${idPrefix}-day`} className="field" value={draft.weekday} onChange={(e) => set('weekday', e.target.value)}>
          <option value="any">Every day</option>
          {LONG_DAYS.map((day, index) => (
            <option key={day} value={index}>
              {day}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${idPrefix}-start`} label="Starts (optional)" hint="Time window, SAST.">
        <input id={`${idPrefix}-start`} type="time" className="field" value={draft.windowStart} onChange={(e) => set('windowStart', e.target.value)} />
      </Field>
      <Field id={`${idPrefix}-end`} label="Ends (optional)">
        <input id={`${idPrefix}-end`} type="time" className="field" value={draft.windowEnd} onChange={(e) => set('windowEnd', e.target.value)} />
      </Field>
      <Field id={`${idPrefix}-desc`} label="Short description" className="md:col-span-2 xl:col-span-3">
        <input id={`${idPrefix}-desc`} className="field" value={draft.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
    </div>
  );
}

function ExistingSpecial({ special, items }: { special: SpecialView; items: { id: string; name: string }[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>({
    title: special.title,
    description: special.description,
    itemId: special.itemId ?? '',
    price: (special.priceCents / 100).toFixed(2),
    weekday: special.weekday === null ? 'any' : String(special.weekday),
    windowStart: special.windowStart ?? '',
    windowEnd: special.windowEnd ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function save() {
    setSaving(true);
    setMessage('');
    const res = await fetch(`/api/staff/specials/${special.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(toPayload(draft)),
    });
    setSaving(false);
    setMessage(res.ok ? 'Saved' : 'Could not save. Check the fields.');
    if (res.ok) router.refresh();
  }

  async function toggleActive() {
    await fetch(`/api/staff/specials/${special.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ active: !special.active }),
    });
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete the special “${special.title}”?`)) return;
    await fetch(`/api/staff/specials/${special.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="card flex flex-col gap-6 p-6">
      <SpecialFields draft={draft} setDraft={setDraft} items={items} idPrefix={special.id} />
      <div className="flex flex-wrap items-center gap-3 border-t border-navy/10 pt-5">
        <button type="button" onClick={save} disabled={saving} className="btn btn-navy btn-sm">
          {saving ? 'Saving…' : 'Save special'}
        </button>
        <button type="button" onClick={toggleActive} aria-pressed={special.active} className={`btn btn-sm ${special.active ? 'btn-outline' : 'btn-ochre'}`}>
          {special.active ? 'Switch off' : 'Switch on'}
        </button>
        <button type="button" onClick={remove} className="btn-quiet text-sm text-danger">
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
        </button>
        <span role="status" className="text-sm font-semibold text-navy">{message}</span>
        <span className="ml-auto text-sm text-muted">
          Currently {formatZAR(special.priceCents)} · {special.active ? 'on' : 'off'}
        </span>
      </div>
    </div>
  );
}

export function SpecialsManager({ specials, categories }: { specials: SpecialView[]; categories: MenuCategory[] }) {
  const router = useRouter();
  const formId = useId();
  const items = categories.flatMap((c) => c.items.map((i) => ({ id: i.id, name: i.name })));
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [message, setMessage] = useState('');

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (draft.title.trim().length < 2) {
      setMessage('Give the special a name');
      return;
    }
    const res = await fetch('/api/staff/specials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...toPayload(draft), active: true }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? 'Could not create the special');
      return;
    }
    setDraft(EMPTY);
    setMessage('Special added');
    router.refresh();
  }

  return (
    <section aria-labelledby="specials-heading" className="flex flex-col gap-10">
      <div>
        <p className="kicker">Specials</p>
        <h1 id="specials-heading" className="mt-1 text-4xl font-bold text-navy">
          Weekly specials and time-limited offers
        </h1>
        <p className="mt-2 max-w-3xl text-sm">
          Specials appear on the homepage, the specials planner and the basket. Set a day, a time window or both. Special
          prices are placeholders until the owner confirms them.
        </p>
      </div>

      <form id={formId} onSubmit={create} className="card flex flex-col gap-6 p-6">
        <h2 className="font-display text-2xl font-bold text-navy">Add a special</h2>
        <SpecialFields draft={draft} setDraft={setDraft} items={items} idPrefix={`${formId}-new`} />
        <div className="flex flex-wrap items-center gap-3 border-t border-navy/10 pt-5">
          <button type="submit" className="btn btn-navy">
            Add special
          </button>
          <span role="status" className="text-sm font-semibold text-navy">{message}</span>
        </div>
      </form>

      <div className="flex flex-col gap-6">
        {specials.map((special) => (
          <ExistingSpecial key={`${special.id}-${special.priceCents}-${special.active}`} special={special} items={items} />
        ))}
      </div>
    </section>
  );
}
