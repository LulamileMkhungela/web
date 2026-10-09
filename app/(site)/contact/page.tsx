import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ContactTabs } from '@/components/contact/ContactTabs';
import { FaqList } from '@/components/contact/FaqList';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BRAND, LONG_DAYS } from '@/lib/config';
import { getSiteSettings } from '@/lib/settings';
import { fromMinutes, openStatus, toMinutes } from '@/lib/time';
import { whatsappLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact, Enquiries & Bookings',
  description:
    'Contact Heritage Bites in Pretoria Central: call, WhatsApp or email, book a table, send an event enquiry or ask about office lunches.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const params = await searchParams;
  const topic = (['event', 'lunch', 'table'] as const).find((t) => t === params.topic) ?? 'general';
  const settings = getSiteSettings();
  const status = openStatus(settings.hours);
  const waNumber = settings.contact.whatsapp.replace(/\D/g, '') || BRAND.whatsappNumber;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`;
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(BRAND.mapQuery)}&output=embed`;

  return (
    <>
      <section className="grain relative overflow-hidden bg-navy text-cream">
        <div className="mx-auto w-full max-w-[1240px] px-5 pb-16 pt-16 sm:px-8">
          <p className="kicker kicker-light">Contact</p>
          <p className="eyebrow eyebrow-light mt-2">We would love to hear from you</p>
          <h1 className="mt-3 text-[clamp(2.6rem,5vw,4.4rem)] font-bold text-cream">Visit, call or message us</h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-[1.8] text-cream/80">
            Questions about the menu, a table for dinner, a catering or event enquiry, or lunches for your office. Send
            us a message and we will reply by the email or mobile number you give us.
          </p>
        </div>
        <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
      </section>

      <section className="mx-auto grid w-full max-w-[1240px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <div className="flex flex-col gap-8">
          <SectionHeading kicker="Send an enquiry" script="Tell us what you need" title="Enquiries and bookings" />
          <ContactTabs defaultTopic={topic} />
        </div>

        <aside aria-labelledby="business-info" className="flex flex-col gap-6 lg:sticky lg:top-44">
          <div className="card flex flex-col gap-6 p-8">
            <h2 id="business-info" className="font-display text-2xl font-bold text-navy">
              Business details
            </h2>
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-ochre-deep" aria-hidden="true" />
              <div>
                <p className="font-semibold text-navy">Address</p>
                <p>
                  {BRAND.street}, {BRAND.suburb}
                  <br />
                  {BRAND.city}, {BRAND.postcode}, {BRAND.region}
                </p>
                <a href={directions} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-navy underline underline-offset-4">
                  Get directions (opens Google Maps)
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-ochre-deep" aria-hidden="true" />
              <div>
                <p className="font-semibold text-navy">Phone</p>
                <a href={`tel:+${settings.contact.phone.replace(/\D/g, '')}`} className="text-body underline underline-offset-4">
                  {settings.contact.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-ochre-deep" aria-hidden="true" />
              <div>
                <p className="font-semibold text-navy">WhatsApp</p>
                <a href={whatsappLink('Hi Heritage Bites!', waNumber)} target="_blank" rel="noopener noreferrer" className="text-body underline underline-offset-4">
                  Chat with us (opens in new tab)
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-ochre-deep" aria-hidden="true" />
              <div>
                <p className="font-semibold text-navy">Email</p>
                <a href={`mailto:${settings.contact.email}`} className="break-all text-body underline underline-offset-4">
                  {settings.contact.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-ochre-deep" aria-hidden="true" />
              <div className="w-full">
                <p className="font-semibold text-navy">
                  Opening hours <span className="ml-2 text-xs font-semibold text-ochre-deep">{status.label}</span>
                </p>
                <ul className="mt-2 grid gap-1 text-sm">
                  {[1, 2, 3, 4, 5, 6, 0].map((index) => {
                    const day = settings.hours[index];
                    return (
                      <li key={index} className="flex justify-between gap-4">
                        <span>{LONG_DAYS[index]}</span>
                        <span>{day ? `${fromMinutes(toMinutes(day.open))} – ${fromMinutes(toMinutes(day.close))}` : 'Closed'}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-navy/10 shadow-soft">
            <iframe
              title="Map showing Heritage Bites, 323 Sisulu Street, Pretoria Central"
              src={mapEmbed}
              className="h-72 w-full border-0 bg-cream-deep"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto w-full max-w-[1240px] px-5 pb-24 sm:px-8">
        <SectionHeading id="faq-heading" kicker="Good to know" script="Questions, answered" title="Frequently asked questions" />
        <div className="mt-12">
          <FaqList />
        </div>
      </section>
    </>
  );
}
