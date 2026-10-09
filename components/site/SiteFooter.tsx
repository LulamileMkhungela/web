import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { BRAND } from '@/lib/config';
import { ABOUT_LINKS, MENU_LINKS } from '@/lib/nav';
import type { ContactSettings } from '@/lib/types';
import { whatsappLink } from '@/lib/whatsapp';

export function SiteFooter({ logo, contact }: { logo: string | null; contact: ContactSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="grain relative mt-24 overflow-hidden bg-navy text-cream/85">
      <div className="band-zigzag opacity-70" aria-hidden="true" />
      <div className="container-hb grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-5">
          <Logo src={logo} tone="light" />
          <p className="max-w-xs leading-relaxed text-cream/80">
            Traditional African food, made with heritage and care in Pretoria Central.
          </p>
          <p className="eyebrow eyebrow-light text-[2rem]">{BRAND.tagline}</p>
        </div>

        <nav aria-label="Footer menu" className="flex flex-col gap-3">
          <p className="kicker kicker-light">Menu</p>
          {MENU_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-cream/85 no-underline hover:text-cream hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Footer about" className="flex flex-col gap-3">
          <p className="kicker kicker-light">About &amp; help</p>
          {ABOUT_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-cream/85 no-underline hover:text-cream hover:underline">
              {link.label}
            </Link>
          ))}
          <Link href="/contact#faq" className="text-cream/85 no-underline hover:text-cream hover:underline">
            Good to know (FAQ)
          </Link>
          <Link href="/contact" className="text-cream/85 no-underline hover:text-cream hover:underline">
            Contact us
          </Link>
          <Link href="/privacy" className="text-cream/85 no-underline hover:text-cream hover:underline">
            Privacy notice
          </Link>
          <Link href="/terms" className="text-cream/85 no-underline hover:text-cream hover:underline">
            Terms
          </Link>
        </nav>

        <div className="flex flex-col gap-3">
          <p className="kicker kicker-light">Visit &amp; contact</p>
          <p className="leading-relaxed">
            {BRAND.street}
            <br />
            {BRAND.suburb}, {BRAND.city}, {BRAND.postcode}
          </p>
          <a href={`tel:${BRAND.phoneTel}`} className="text-cream no-underline hover:underline">
            {contact.phone}
          </a>
          <a href={whatsappLink('Hi Heritage Bites, I have a question.', contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-cream no-underline hover:underline">
            WhatsApp us
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href={`mailto:${contact.email}`} className="break-all text-cream no-underline hover:underline">
            {contact.email}
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-hb flex flex-col gap-2 py-6 text-sm text-cream/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Heritage Bites. All rights reserved.</p>
          <p>{BRAND.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
