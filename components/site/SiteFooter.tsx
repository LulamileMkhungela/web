import Link from 'next/link';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SocialIcons, hasSocialLinks } from '@/components/site/SocialIcons';
import { Logo } from '@/components/ui/Logo';
import { BRAND } from '@/lib/config';
import { FOOTER_ABOUT_LINKS, FOOTER_HELP_LINKS, FOOTER_MENU_LINKS, type NavLink } from '@/lib/nav';
import type { ContactSettings, SocialLinks } from '@/lib/types';
import { whatsappLink } from '@/lib/whatsapp';

const LINK = 'text-cream/85 no-underline hover:text-cream hover:underline underline-offset-4';
const ICON = 'mt-0.5 h-4 w-4 shrink-0 text-ochre-bright';

function LinkGroup({ id, title, links }: { id: string; title: string; links: NavLink[] }) {
  return (
    <nav aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="kicker kicker-light font-sans">
        {title}
      </h2>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={LINK}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Footer: the same groups as the header with fewer links. Contact lines carry icons. Social icons show only once a link is saved. */
export function SiteFooter({
  logo,
  contact,
  social,
}: {
  logo: string | null;
  contact: ContactSettings;
  social: SocialLinks;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="grain relative mt-24 overflow-hidden bg-navy text-cream/85">
      <div className="band-beads" aria-hidden="true" />
      <div className="container-hb grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.2fr] lg:gap-10">
        <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
          <Logo src={logo} tone="light" />
          <p className="max-w-xs leading-relaxed text-cream/80">
            Traditional African food, made with heritage and care in Pretoria Central.
          </p>
          <p className="eyebrow eyebrow-light text-[2rem]">{BRAND.tagline}</p>
        </div>

        <LinkGroup id="footer-menu" title="Menu" links={FOOTER_MENU_LINKS} />
        <LinkGroup id="footer-about" title="About" links={FOOTER_ABOUT_LINKS} />

        <nav aria-labelledby="footer-visit" className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <h2 id="footer-visit" className="kicker kicker-light font-sans">
            Visit &amp; contact
          </h2>
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3">
              <MapPin className={ICON} aria-hidden="true" />
              <span className="leading-relaxed">
                {BRAND.street}, {BRAND.suburb}, {BRAND.city}, {BRAND.postcode}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className={ICON} aria-hidden="true" />
              <a href={`tel:${BRAND.phoneTel}`} className={LINK}>
                {contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle className={ICON} aria-hidden="true" />
              <a
                href={whatsappLink('Hi Heritage Bites, I have a question.', contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                WhatsApp us
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className={ICON} aria-hidden="true" />
              <a href={`mailto:${contact.email}`} className={`${LINK} break-all`}>
                {contact.email}
              </a>
            </li>
            {hasSocialLinks(social) ? (
              <li className="flex flex-col gap-3 pt-2">
                <p className="text-cream/80">Follow us</p>
                <SocialIcons social={social} tone="light" />
              </li>
            ) : null}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-hb flex flex-col gap-3 py-5 text-sm text-cream/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Heritage Bites. All rights reserved.</p>
          <nav aria-label="Help and legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_HELP_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={LINK}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
