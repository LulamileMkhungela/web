'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatZAR } from '@/lib/money';
import { CHANNEL_LABEL, NEXT_STATUSES, PAYMENT_METHOD_LABEL, STATUS_LABEL } from '@/lib/status';
import { formatSAST } from '@/lib/time';
import type { OrderStatus, OrderView } from '@/lib/types';

const ACTIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  new: { next: 'preparing', label: 'Start preparing' },
  preparing: { next: 'ready', label: 'Mark ready' },
  ready: { next: 'collected', label: 'Mark collected' },
  awaiting_payment: { next: 'new', label: 'Confirm payment' },
};

const COLUMNS: { id: string; title: string; statuses: OrderStatus[]; tone: string }[] = [
  { id: 'awaiting', title: 'Awaiting payment', statuses: ['awaiting_payment'], tone: 'border-ochre/50' },
  { id: 'new', title: 'New', statuses: ['new'], tone: 'border-navy/40' },
  { id: 'preparing', title: 'Preparing', statuses: ['preparing'], tone: 'border-ochre' },
  { id: 'ready', title: 'Ready for collection', statuses: ['ready'], tone: 'border-success' },
  { id: 'done', title: 'Collected or cancelled', statuses: ['collected', 'cancelled'], tone: 'border-navy/15' },
];

function OrderCard({ order, onAction, busy }: { order: OrderView; onAction: (status: OrderStatus) => void; busy: boolean }) {
  const action = ACTIONS[order.status];
  const cancellable = NEXT_STATUSES[order.status].includes('cancelled');
  return (
    <article className="card flex flex-col gap-4 p-5" aria-label={`Order ${order.displayNumber}`}>
      <header className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-2xl font-bold text-navy">{order.displayNumber}</p>
          <p className="whitespace-nowrap font-display text-xl font-bold text-navy">{formatZAR(order.totalCents, true)}</p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {CHANNEL_LABEL[order.channel]} · {order.fulfilment === 'dine_in' ? 'Dine-in' : 'Collection'} · placed {formatSAST(order.createdAt)}
        </p>
        <p className="text-xs text-muted">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</p>
      </header>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold text-navy">{order.customerName || 'Walk-in'}</span>
        {order.customerPhone ? (
          <a href={`tel:${order.customerPhone.replace(/\s/g, '')}`} className="font-semibold text-navy underline underline-offset-4">
            {order.customerPhone}
          </a>
        ) : null}
        {order.pickupAt ? <span>Pickup {formatSAST(order.pickupAt)}</span> : null}
      </div>
      <ul className="grid gap-1.5 rounded-2xl bg-cream p-4 text-sm">
        {order.lines.map((line) => (
          <li key={line.key} className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-2">
            <span className="whitespace-nowrap font-bold text-navy">{line.qty}×</span>
            <span className="min-w-0 break-words">{line.name}</span>
            <span className="shrink-0 whitespace-nowrap">{formatZAR(line.lineTotalCents, true)}</span>
          </li>
        ))}
      </ul>
      {order.notes ? (
        <p className="rounded-xl border border-ochre/40 bg-ochre-wash px-4 py-2 text-sm">
          <span className="font-bold text-navy">Notes:</span> {order.notes}
        </p>
      ) : null}
      {order.paymentStatus === 'refund_due' ? (
        <p className="rounded-xl bg-danger/10 px-4 py-2 text-sm font-semibold text-danger">
          This order was paid and then cancelled. Refund it through your payment provider.
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2">
        {action ? (
          <button type="button" disabled={busy} onClick={() => onAction(action.next)} className="btn btn-navy btn-sm">
            {action.label}
          </button>
        ) : null}
        <Link href={`/staff/ticket/${order.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
          Print ticket
        </Link>
        {cancellable ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (window.confirm(`Cancel ${order.displayNumber} for ${order.customerName || 'this customer'}?`)) onAction('cancelled');
            }}
            className="btn-quiet text-sm text-danger"
          >
            Cancel order
          </button>
        ) : null}
      </div>
      <p className="text-xs text-muted">{STATUS_LABEL[order.status]}</p>
    </article>
  );
}

export function OrdersBoard({ orders, onChanged }: { orders: OrderView[]; onChanged: () => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function move(order: OrderView, status: OrderStatus) {
    setBusyId(order.id);
    setError('');
    try {
      const res = await fetch(`/api/staff/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) setError(data.error ?? 'That change could not be saved.');
      onChanged();
    } catch {
      setError('We could not reach the server. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  return (
    <section aria-labelledby="board-heading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Live orders</p>
          <h1 id="board-heading" className="mt-1 text-4xl font-bold text-navy">
            Kitchen and counter board
          </h1>
          <p className="mt-2 text-sm">Orders from the website, WhatsApp, walk-ins, phone, Uber Eats and Mr D. This board refreshes every 5 seconds.</p>
        </div>
      </div>
      {error ? (
        <p role="alert" className="rounded-2xl bg-danger/10 px-5 py-3 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-5">
        {COLUMNS.map((column) => {
          const items = orders
            .filter((o) => column.statuses.includes(o.status))
            .filter((o) => column.id !== 'done' || o.createdAt.slice(0, 10) === todayKey || o.updatedAt.slice(0, 10) === todayKey)
            .slice(0, column.id === 'done' ? 25 : 60);
          return (
            <div key={column.id} className={`flex min-h-[10rem] flex-col gap-4 rounded-[1.75rem] border-t-4 bg-white/60 p-4 ${column.tone}`}>
              <div className="flex items-center justify-between px-1">
                <h2 className="font-semibold text-navy">{column.title}</h2>
                <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-sm font-bold text-navy">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <p className="px-1 py-6 text-sm text-muted">Nothing here right now.</p>
              ) : (
                items.map((order) => (
                  <OrderCard key={order.id} order={order} busy={busyId === order.id} onAction={(status) => move(order, status)} />
                ))
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
