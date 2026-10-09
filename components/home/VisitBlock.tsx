import Link from 'next/link';
import { CalendarDays, Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BRAND, LONG_DAYS } from '@/lib/config';
import { openStatus, sastNow } from '@/lib/time';
import type { ContactSettings, Hours } from '@/lib/types';
import { whatsappLink } from '@/lib/whatsapp';

/** Address, opening hours, quick ways to reach us, and a map. */
export function VisitBlock({ hours, contact }: { hours: Hours; contact: ContactSettings }) {
  const today = sastNow().weekday;
  const status = openStatus(hours);
  const order = [1, 2, 3, 4, 5, 6, 0];
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(BRAND.mapQuery)}&output=embed`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`;
  return (
    <section aria-labelledby="visit-heading" className="container-hb py-16 md:py-24">
      <SectionHeading id="visit-heading" kicker="Visit us" script="Come and sit with us" title="Find us in Pretoria Central" />
      <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card flex flex-col gap-7 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-ochre-deep" aria-hidden="true" />
            <div>
              <p className="font-semibold text-navy">Address</p>
              <p className="mt-1">
                {BRAND.street}, {BRAND.suburb}
                <br />
                {BRAND.city}, {BRAND.postcode}, {BRAND.region}
              </p>
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 font-semibold text-navy underline underline-offset-4"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get directions (opens Google Maps)
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock className="mt-1 h-5 w-5 shrink-0 text-ochre-deep" aria-hidden="true" />
            <div className="w-full">
              <p className="font-semibold text-navy">
                Opening hours{' '}
                <span className="ml-2 rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-semibold text-navy">
                  {status.label}
                </span>
              </p>
              <ul className="mt-3 grid gap-1.5 text-sm">
                {order.map((index) => {
                  const day = hours[index];
                  const isToday = index === today;
                  return (
                    <li
                      key={index}
                      className={`flex justify-between gap-4 rounded-xl px-3 py-1.5 ${
                        isToday ? 'bg-ochre-wash font-semibold text-navy' : ''
                      }`}
                    >
                      <span>
                        {LONG_DAYS[index]}
                        {isToday ? ' (today)' : ''}
                      </span>
                      <span>{day ? `${day.open} to ${day.close}` : 'Closed'}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-muted">{status.detail}</p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-navy/10 pt-6 sm:grid-cols-2">
            <a href={`tel:${BRAND.phoneTel}`} className="btn btn-outline btn-sm w-full">
              <Phone className="h-4 w-4" aria-hidden="true" /> Call
            </a>
            <a
              href={whatsappLink('Hi Heritage Bites, I have a question.', contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm w-full"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={`mailto:${contact.email}`} className="btn btn-outline btn-sm w-full">
              <Mail className="h-4 w-4" aria-hidden="true" /> Email
            </a>
            <Link href="/contact?topic=table" className="btn btn-navy btn-sm w-full">
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book a table
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-navy/10 shadow-soft">
          <iframe
            title="Map showing Heritage Bites, 323 Sisulu Street, Pretoria Central"
            src={mapEmbed}
            className="h-full min-h-[420px] w-full border-0 bg-cream-deep"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
