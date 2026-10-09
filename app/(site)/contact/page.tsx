import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { ContactForm } from '@/components/contact/ContactForm';
import { FaqList } from '@/components/contact/FaqList';
import { OpeningHours } from '@/components/site/OpeningHours';
import { PageHeader } from '@/components/site/PageHeader';
import { SocialIcons } from '@/components/site/SocialIcons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BRAND } from '@/lib/config';
import { getSiteSettings } from '@/lib/settings';
import { whatsappLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Heritage Bites in Pretoria Central: send us a message, call or WhatsApp us, find our location on the map and check our opening hours.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const settings = getSiteSettings();
  const contact = settings.contact;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`;
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(BRAND.mapQuery)}&output=embed`;
  return (
    <>
      <PageHeader kicker="Contact" script="We would love to hear from you" title="Contact Heritage Bites">
        Questions, feedback or an order query? Send us a message, or reach us directly on WhatsApp or by phone.
      </PageHeader>

      <section className="container-hb py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <ContactForm />

          <aside className="card flex flex-col gap-7 p-6 sm:p-8 lg:sticky lg:top-28">
            <div>
              <h2 className="text-2xl font-bold">Visit or call</h2>
              <div className="mt-3 flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-ochre-deep" aria-hidden="true" />
                <address className="text-[1.02rem] not-italic leading-relaxed">
                  {BRAND.street}
                  <br />
                  {BRAND.suburb}, {BRAND.city}, {BRAND.postcode}
                </address>
              </div>
            </div>
            <div className="grid gap-3">
              <a href={`tel:${BRAND.phoneTel}`} className="btn btn-outline btn-block">
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {contact.phone}
              </a>
              <a
                href={whatsappLink('Hi Heritage Bites, I have a question.', contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-block"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat on WhatsApp
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block">
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get directions
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={`mailto:${contact.email}`} className="btn btn-outline btn-block">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email us
              </a>
            </div>
            <OpeningHours hours={settings.hours} />
            <div className="flex flex-col gap-3 border-t border-navy/10 pt-6">
              <p className="font-semibold text-navy">Follow us</p>
              <SocialIcons social={settings.social} tone="dark" />
            </div>
          </aside>
        </div>

        <section id="find-us" aria-labelledby="map-heading" className="mt-20 scroll-mt-40">
          <SectionHeading id="map-heading" kicker="Find us" script="Easy to find in Pretoria Central" title="Our location" />
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-navy/10 shadow-soft">
            <iframe
              title={`Map showing Heritage Bites, ${BRAND.street}, Pretoria Central`}
              src={mapEmbed}
              className="h-[420px] w-full border-0 bg-cream-deep sm:h-[480px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-semibold text-navy">
              {BRAND.street}, {BRAND.suburb}, {BRAND.city}, {BRAND.postcode}
            </span>
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-navy underline underline-offset-4"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Get directions (opens Google Maps)
            </a>
          </p>
        </section>

        <div id="faq" className="mt-20 scroll-mt-40">
          <SectionHeading id="faq-heading" kicker="Good to know" script="Questions, answered" title="Frequently asked questions" />
          <div className="mt-8">
            <FaqList />
          </div>
        </div>
      </section>
    </>
  );
}
