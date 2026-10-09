'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatZAR } from '@/lib/money';
import type { MenuCategory } from '@/lib/types';

function PriceEditor({ id, priceCents, onSaved }: { id: string; priceCents: number; onSaved: () => void }) {
  const [value, setValue] = useState((priceCents / 100).toFixed(2));
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function save() {
    const rands = Number(value);
    if (!Number.isFinite(rands) || rands < 1) {
      setState('error');
      setMessage('Enter a price of R1 or more');
      return;
    }
    setState('saving');
    const res = await fetch(`/api/staff/items/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ priceCents: Math.round(rands * 100) }),
    });
    if (!res.ok) {
      setState('error');
      setMessage('Could not save');
      return;
    }
    setState('saved');
    setMessage('Saved');
    onSaved();
    setTimeout(() => setState('idle'), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor={`price-${id}`}>
        Price in rand
      </label>
      <span className="text-sm font-semibold text-navy" aria-hidden="true">
        R
      </span>
      <input
        id={`price-${id}`}
        type="number"
        min={1}
        step="0.50"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="field h-11 w-28 rounded-xl text-right"
      />
      <button type="button" onClick={save} disabled={state === 'saving'} className="btn btn-navy btn-sm">
        {state === 'saving' ? 'Saving…' : 'Save'}
      </button>
      <span className="min-w-[4rem] text-xs font-semibold" role="status" aria-live="polite">
        {state === 'saved' || state === 'error' ? <span className={state === 'error' ? 'text-danger' : 'text-success'}>{message}</span> : null}
      </span>
    </div>
  );
}

export function MenuManager({ categories }: { categories: MenuCategory[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(id: string, available: boolean) {
    setBusy(id);
    await fetch(`/api/staff/items/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ available: !available }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <section aria-labelledby="menu-heading" className="flex flex-col gap-10">
      <div>
        <p className="kicker">Menu</p>
        <h1 id="menu-heading" className="mt-1 text-4xl font-bold text-navy">
          Availability and prices
        </h1>
        <p className="mt-2 max-w-3xl text-sm">
          Mark a dish sold out to hide the add buttons on the website and in search straight away. Change a price here and
          it applies to the next order. Prices are VAT-inclusive.
        </p>
      </div>
      {categories.map((category) => (
        <div key={category.id} className="card overflow-hidden">
          <div className="border-b border-navy/10 bg-white px-6 py-4">
            <h2 className="font-display text-2xl font-bold text-navy">{category.name}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-cream text-xs font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">Dish</th>
                  <th scope="col" className="px-6 py-3">Price (incl. VAT)</th>
                  <th scope="col" className="px-6 py-3">Availability</th>
                  <th scope="col" className="px-6 py-3">Photos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {category.items.map((item) => (
                  <tr key={item.id} className="align-middle">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-navy">{item.name}</p>
                      <p className="text-xs text-muted">{item.subtitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <PriceEditor id={item.id} priceCents={item.priceCents} onSaved={() => router.refresh()} />
                      <p className="mt-1 text-xs text-muted">Shown as {formatZAR(item.priceCents)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={busy === item.id}
                        onClick={() => toggle(item.id, item.available)}
                        aria-pressed={item.available}
                        className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                          item.available ? 'bg-success text-white' : 'bg-danger text-white'
                        }`}
                      >
                        {item.available ? 'On the menu' : 'Sold out'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-muted">{item.images.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}
