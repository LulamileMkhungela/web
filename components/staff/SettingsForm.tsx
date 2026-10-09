'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field } from '@/components/ui/Field';
import { LONG_DAYS } from '@/lib/config';
import type { Checklist, ChecklistKey, Hours, SiteSettings } from '@/lib/types';

const CHECKLIST: { key: ChecklistKey; label: string; help: string }[] = [
  { key: 'prices_confirmed', label: 'Menu prices confirmed', help: 'Prices on the menu and specials are placeholders until the owner confirms them.' },
  { key: 'hours_confirmed', label: 'Opening hours confirmed', help: 'The hours on the site and in pickup times must match the real trading hours.' },
  { key: 'store_links_set', label: 'Uber Eats and Mr D store links set', help: 'Point the buttons at your own store pages.' },
  { key: 'photos_replaced', label: 'Photos replaced with your own', help: 'The current photos are web placeholders. Replace them with photos of your food.' },
  { key: 'vision_mission_confirmed', label: 'Vision and mission confirmed', help: 'The vision and mission on the About page are drafts for the owner to approve.' },
  { key: 'contact_confirmed', label: 'Contact details confirmed', help: 'Phone, WhatsApp number and email address are correct.' },
];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const ids = useId();
  const [hours, setHours] = useState<Hours>(settings.hours);
  const [storeLinks, setStoreLinks] = useState(settings.storeLinks);
  const [social, setSocial] = useState(settings.social);
  const [prep, setPrep] = useState(settings.prep);
  const [contact, setContact] = useState(settings.contact);
  const [checklist, setChecklist] = useState<Checklist>(settings.checklist);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  function setDay(index: number, patch: Partial<{ open: string; close: string }> | null) {
    setHours((h) =>
      h.map((day, i) => {
        if (i !== index) return day;
        if (patch === null) return null;
        return { open: day?.open ?? '07:00', close: day?.close ?? '20:00', ...patch };
      }),
    );
  }

  async function save() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/staff/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hours, storeLinks, social, prep, contact, checklist }),
    });
    const data = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error ?? 'Could not save these settings.');
      return;
    }
    setMessage('Settings saved. The website and pickup times now use them.');
    router.refresh();
  }

  const done = Object.values(checklist).filter(Boolean).length;

  return (
    <section aria-labelledby="settings-heading" className="flex flex-col gap-10">
      <div>
        <p className="kicker">Settings</p>
        <h1 id="settings-heading" className="mt-1 text-4xl font-bold text-navy">
          Hours, links and launch checklist
        </h1>
        <p className="mt-2 max-w-3xl text-sm">
          These settings drive the opening-hours display, pickup times, the Uber Eats and Mr D buttons, and the contact details
          on the site.
        </p>
      </div>

      <div className="card flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-navy">Launch checklist</h2>
          <span className="rounded-full bg-navy px-4 py-1.5 text-sm font-bold text-cream">
            {done} of {CHECKLIST.length} confirmed
          </span>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {CHECKLIST.map((item) => (
            <li key={item.key}>
              <label className="flex h-full cursor-pointer items-start gap-3 rounded-2xl border border-navy/10 bg-white p-4">
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#B77E23]"
                />
                <span>
                  <span className="block font-semibold text-navy">{item.label}</span>
                  <span className="mt-1 block text-sm">{item.help}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="card grid gap-6 p-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-2xl font-bold text-navy">Opening hours</h2>
          <p className="text-sm">Set each day’s hours. Untick a day to mark it closed. Pickup times only appear inside these hours.</p>
          <ul className="grid gap-3">
            {[1, 2, 3, 4, 5, 6, 0].map((index) => {
              const day = hours[index];
              const base = `${ids}-${index}`;
              return (
                <li key={index} className="grid items-center gap-3 rounded-2xl bg-white p-4 sm:grid-cols-[9rem_auto_1fr_1fr]">
                  <label className="flex items-center gap-3 font-semibold text-navy" htmlFor={`${base}-open`}>
                    <input
                      id={`${base}-open`}
                      type="checkbox"
                      checked={day !== null}
                      onChange={(e) => setDay(index, e.target.checked ? { open: '07:00', close: '20:00' } : null)}
                      className="h-4 w-4 accent-[#B77E23]"
                    />
                    {LONG_DAYS[index]}
                  </label>
                  <span className="hidden sm:block" />
                  <div>
                    <label className="sr-only" htmlFor={`${base}-from`}>
                      {LONG_DAYS[index]} opens
                    </label>
                    <input
                      id={`${base}-from`}
                      type="time"
                      value={day?.open ?? ''}
                      disabled={!day}
                      onChange={(e) => setDay(index, { open: e.target.value })}
                      className="field h-11 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`${base}-to`}>
                      {LONG_DAYS[index]} closes
                    </label>
                    <input
                      id={`${base}-to`}
                      type="time"
                      value={day?.close ?? ''}
                      disabled={!day}
                      onChange={(e) => setDay(index, { close: e.target.value })}
                      className="field h-11 rounded-xl"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-2xl font-bold text-navy">Delivery app links</h2>
            <Field id={`${ids}-ubereats`} label="Uber Eats store link" hint="Paste the full link to your Uber Eats store page.">
              <input id={`${ids}-ubereats`} className="field" value={storeLinks.ubereats} onChange={(e) => setStoreLinks({ ...storeLinks, ubereats: e.target.value })} />
            </Field>
            <Field id={`${ids}-mrd`} label="Mr D store link" hint="Paste the full link to your Mr D store page.">
              <input id={`${ids}-mrd`} className="field" value={storeLinks.mrd} onChange={(e) => setStoreLinks({ ...storeLinks, mrd: e.target.value })} />
            </Field>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-2xl font-bold text-navy">Social media</h2>
            <p className="text-sm text-muted">
              Paste the full link to each page. An icon appears on the website only when its link is filled in.
            </p>
            <Field id={`${ids}-facebook`} label="Facebook page link" hint="For example https://www.facebook.com/yourpage">
              <input id={`${ids}-facebook`} className="field" placeholder="https://" value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} />
            </Field>
            <Field id={`${ids}-instagram`} label="Instagram profile link" hint="For example https://www.instagram.com/yourprofile">
              <input id={`${ids}-instagram`} className="field" placeholder="https://" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} />
            </Field>
            <Field id={`${ids}-tiktok`} label="TikTok profile link" hint="For example https://www.tiktok.com/@yourprofile">
              <input id={`${ids}-tiktok`} className="field" placeholder="https://" value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} />
            </Field>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-2xl font-bold text-navy">Contact details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={`${ids}-phone`} label="Phone">
                <input id={`${ids}-phone`} className="field" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </Field>
              <Field id={`${ids}-wa`} label="WhatsApp number" hint="International format, digits only, e.g. 27670137587">
                <input id={`${ids}-wa`} className="field" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
              </Field>
            </div>
            <Field id={`${ids}-email`} label="Email">
              <input id={`${ids}-email`} type="email" className="field" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            </Field>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-2xl font-bold text-navy">Kitchen timing</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field id={`${ids}-base`} label="Base minutes">
                <input id={`${ids}-base`} type="number" min={0} className="field" value={prep.baseMinutes} onChange={(e) => setPrep({ ...prep, baseMinutes: Number(e.target.value) })} />
              </Field>
              <Field id={`${ids}-per`} label="Extra per open order">
                <input id={`${ids}-per`} type="number" min={0} className="field" value={prep.perOpenOrderMinutes} onChange={(e) => setPrep({ ...prep, perOpenOrderMinutes: Number(e.target.value) })} />
              </Field>
              <Field id={`${ids}-max`} label="Maximum minutes">
                <input id={`${ids}-max`} type="number" min={10} className="field" value={prep.maxMinutes} onChange={(e) => setPrep({ ...prep, maxMinutes: Number(e.target.value) })} />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} disabled={saving} className="btn btn-navy">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        <span role="status" className="text-sm font-semibold text-navy">{message}</span>
        <p className="text-sm text-muted">
          The staff PIN is set with the STAFF_PIN environment variable. Change it on the server and restart the app.
        </p>
      </div>
    </section>
  );
}
