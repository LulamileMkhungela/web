import Link from 'next/link';
import { BRAND, DEFAULT_STORE_LINKS, LONG_DAYS } from '@/lib/config';
import { whatsappLink } from '@/lib/whatsapp';
import { Logo } from '@/components/ui/Logo';
import { SubscribeForm } from '@/components/site/SubscribeForm';
import type { Hours, ContactSettings, StoreLinks } from '@/lib/types';
import { fromMinutes, toMinutes } from '@/lib/time';

export function SiteFooter({
  hours,
  contact,
  storeLinks,
}: {
  hours: Hours;
  contact: ContactSettings;
  storeLinks: StoreLinks;
}) {
  const waNumber = contact.whatsapp.replace(/\D/g, '') || BRAND.whatsappNumber;
  const ubereats = storeLinks.ubereats || DEFAULT_STORE_LINKS.ubereats;
  const mrd = storeLinks.mrd || DEFAULT_STORE_LINKS.mrd;
  const reorderedHours = [1, 2, 3, 4, 5, 6, 0].map((index) => ({ day: LONG_DAYS[index], hours: hours[index] }));
  return (
    <footer className="no-print grain relative mt-24 overflow-hidden bg-navy text-cream/80">
      <div className="band-zigzag opacity-70" aria-hidden="true" />
      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-5">
          <Logo tone="light" />
          <p className="max-w-sm text-[0.95rem] leading-[1.8] text-cream/75">{BRAND.description}</p>
          <p className="eyebrow eyebrow-light text-[2.2rem]">{BRAND.tagline}</p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="kicker kicker-light font-sans text-[0.72rem] normal-case">Visit us</h2>
          <address className="not-italic leading-[1.8] text-cream/85">
            {BRAND.street}
            <br />
            {BRAND.suburb}, {BRAND.city}
            <br />
            {BRAND.postcode}, {BRAND.region}, South Africa
          </address>
          <ul className="grid gap-1.5 text-sm">
            {reorderedHours.map((row) => (
              <li key={row.day} className="flex justify-between gap-4 border-b border-cream/10 py-1">
                <span>{row.day}</span>
                <span className="text-cream/90">
                  {row.hours ? `${fromMinutes(toMinutes(row.hours.open))} – ${fromMinutes(toMinutes(row.hours.close))}` : 'Closed'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="kicker kicker-light font-sans text-[0.72rem] normal-case">Order &amp; contact</h2>
          <ul className="grid gap-2.5 text-[0.95rem]">
            <li>
              <Link href="/menu" className="text-cream no-underline hover:text-ochre-bright">
                Order online for collection
              </Link>
            </li>
            <li>
              <a
                href={whatsappLink(undefined, waNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream no-underline hover:text-ochre-bright"
              >
                WhatsApp us (opens in new tab)
              </a>
            </li>
            <li>
              <a href={`tel:+${contact.phone.replace(/\D/g, '')}`} className="text-cream no-underline hover:text-ochre-bright">
                Call {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="text-cream no-underline hover:text-ochre-bright">
                {contact.email}
              </a>
            </li>
            <li>
              <a href={ubereats} target="_blank" rel="noopener noreferrer" className="text-cream no-underline hover:text-ochre-bright">
                Uber Eats (opens in new tab)
              </a>
            </li>
            <li>
              <a href={mrd} target="_blank" rel="noopener noreferrer" className="text-cream no-underline hover:text-ochre-bright">
                Mr D (opens in new tab)
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="kicker kicker-light font-sans text-[0.72rem] normal-case">Explore</h2>
          <ul className="grid gap-2.5 text-[0.95rem]">
            {[
              ['/about', 'About Us'],
              ['/about#how-we-started', 'How We Started'],
              ['/menu', 'Offering / Meals'],
              ['/specials', 'This Week’s Specials'],
              ['/contact', 'Contact & Enquiries'],
              ['/search', 'Search the menu'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-cream no-underline hover:text-ochre-bright">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 rounded-3xl border border-cream/10 bg-navy-soft/60 p-5">
            <SubscribeForm variant="dark" />
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-5 py-6 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="text-cream/70">Demo build: card and Yoco payments are simulated. Nothing is charged.</p>
          <nav aria-label="Legal" className="flex gap-5">
            <Link href="/privacy" className="text-cream/70 no-underline hover:text-ochre-bright">
              Privacy
            </Link>
            <Link href="/terms" className="text-cream/70 no-underline hover:text-ochre-bright">
              Terms
            </Link>
            <Link href="/staff" className="text-cream/70 no-underline hover:text-ochre-bright">
              Staff
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
