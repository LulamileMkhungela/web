import Link from 'next/link';
import { OpeningHours } from '@/components/site/OpeningHours';
import { BRAND } from '@/lib/config';
import { whatsappLink } from '@/lib/whatsapp';
import type { ContactSettings, Hours } from '@/lib/types';

export function VisitBlock({ hours, contact }: { hours: Hours; contact: ContactSettings }) {
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`;
  return (
    <section className="bg-navy text-cream" aria-labelledby="visit-heading">
      <div className="container-hb grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <div>
            <p className="kicker kicker-light">Visit us</p>
            <h2 id="visit-heading" className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold text-cream">
              Dine in, collect or get it delivered
            </h2>
          </div>
          <address className="text-lg not-italic leading-relaxed text-cream/90">
            {BRAND.street}
            <br />
            {BRAND.suburb}, {BRAND.city}, {BRAND.postcode}
          </address>
          <ul className="flex flex-col gap-3 text-lg">
            <li>
              <a href={`tel:${BRAND.phoneTel}`} className="font-semibold text-cream">
                Call {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink('Hi Heritage Bites, I have a question.', contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cream"
              >
                WhatsApp us
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Get directions
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <Link href="/contact" className="btn btn-ghost-light">
              Contact us
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-navy-soft p-6 sm:p-8">
          <OpeningHours hours={hours} tone="dark" />
        </div>
      </div>
    </section>
  );
}
