'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BellRing, LogOut, Plus, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { OrdersBoard } from '@/components/staff/OrdersBoard';
import { MenuManager } from '@/components/staff/MenuManager';
import { SpecialsManager } from '@/components/staff/SpecialsManager';
import { MessagesInbox } from '@/components/staff/MessagesInbox';
import { SettingsForm } from '@/components/staff/SettingsForm';
import { NewOrderDialog } from '@/components/staff/NewOrderDialog';
import type { MenuCategory, MessageView, OrderView, SiteSettings, SpecialView } from '@/lib/types';

type Tab = 'orders' | 'menu' | 'specials' | 'messages' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'orders', label: 'Orders' },
  { id: 'menu', label: 'Menu & availability' },
  { id: 'specials', label: 'Specials' },
  { id: 'messages', label: 'Enquiries' },
  { id: 'settings', label: 'Settings & checklist' },
];

function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [660, 880, 990].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.32);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.34);
    });
  } catch {
    /* audio may be blocked until the user interacts */
  }
}

export function StaffConsole({
  initialOrders,
  categories,
  specials,
  messages,
  settings,
}: {
  initialOrders: OrderView[];
  categories: MenuCategory[];
  specials: SpecialView[];
  messages: MessageView[];
  settings: SiteSettings;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<OrderView[]>(initialOrders);
  const [banner, setBanner] = useState('');
  const [soundOn, setSoundOn] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const knownIds = useRef<Set<string>>(new Set(initialOrders.map((o) => o.id)));
  const soundRef = useRef(false);
  soundRef.current = soundOn;

  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/orders', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/staff/login');
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { orders: OrderView[] };
      const fresh = data.orders.filter((o) => !knownIds.current.has(o.id) && o.status !== 'awaiting_payment');
      if (fresh.length > 0) {
        setBanner(`New order${fresh.length > 1 ? 's' : ''}: ${fresh.map((o) => `${o.displayNumber} (${o.channel.replace('_', ' ')})`).join(', ')}`);
        if (soundRef.current) playChime();
      }
      data.orders.forEach((o) => knownIds.current.add(o.id));
      setOrders(data.orders);
      setLastSync(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      /* network blip: try again on the next tick */
    }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(refreshOrders, 5000);
    return () => clearInterval(timer);
  }, [refreshOrders]);

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' });
    router.replace('/staff/login');
    router.refresh();
  }

  const activeCount = orders.filter((o) => ['new', 'preparing', 'ready'].includes(o.status)).length;
  const newCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-40 border-b border-navy/10 bg-navy text-cream">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Logo tone="light" />
            <span className="hidden rounded-full bg-ochre px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy sm:inline">
              Staff console
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="hidden items-center gap-2 text-cream/75 md:inline-flex" aria-live="polite">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Live {lastSync ? `· updated ${lastSync}` : ''}
            </span>
            <span className="rounded-full bg-cream/10 px-3 py-1.5 font-semibold">
              {activeCount} active · {newCount} new
            </span>
            <button
              type="button"
              onClick={() => {
                setSoundOn((v) => !v);
                if (!soundOn) playChime();
              }}
              aria-pressed={soundOn}
              className="btn btn-ghost-light btn-sm"
            >
              {soundOn ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
              {soundOn ? 'Sound on' : 'Enable sound'}
            </button>
            <button type="button" onClick={() => setNewOrderOpen(true)} className="btn btn-ochre btn-sm">
              <Plus className="h-4 w-4" aria-hidden="true" /> New order
            </button>
            <Link href="/" className="btn btn-ghost-light btn-sm" target="_blank" rel="noopener noreferrer">
              View site
            </Link>
            <button type="button" onClick={signOut} className="btn btn-ghost-light btn-sm">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
        <nav aria-label="Console sections" className="border-t border-cream/10">
          <ul className="mx-auto flex w-full max-w-[1400px] gap-1 overflow-x-auto px-5 sm:px-8">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? 'page' : undefined}
                  className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    tab === t.id ? 'border-ochre-bright text-ochre-bright' : 'border-transparent text-cream/75 hover:text-cream'
                  }`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {banner ? (
        <div role="status" className="no-print mx-auto mt-5 flex w-full max-w-[1400px] items-center justify-between gap-4 rounded-2xl border border-ochre/40 bg-ochre-wash px-5 py-3 text-sm font-semibold text-navy sm:px-8">
          <span className="flex items-center gap-2">
            <BellRing className="h-4 w-4" aria-hidden="true" /> {banner}
          </span>
          <button type="button" onClick={() => setBanner('')} className="btn-quiet text-sm">
            Dismiss
          </button>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8">
        {tab === 'orders' ? (
          <OrdersBoard orders={orders} onChanged={refreshOrders} />
        ) : null}
        {tab === 'menu' ? <MenuManager categories={categories} /> : null}
        {tab === 'specials' ? <SpecialsManager specials={specials} categories={categories} /> : null}
        {tab === 'messages' ? <MessagesInbox messages={messages} /> : null}
        {tab === 'settings' ? <SettingsForm settings={settings} /> : null}
      </main>

      {newOrderOpen ? (
        <NewOrderDialog
          categories={categories}
          onClose={() => setNewOrderOpen(false)}
          onCreated={() => {
            setNewOrderOpen(false);
            refreshOrders();
          }}
        />
      ) : null}
    </div>
  );
}
