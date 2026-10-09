import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { ContactForm, type ContactTopic } from '@/components/contact/ContactForm';
import { FaqList } from '@/components/contact/FaqList';
import { OpeningHours } from '@/components/site/OpeningHours';
import { PageHeader } from '@/components/site/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BRAND } from '@/lib/config';
import { getSiteSettings } from '@/lib/settings';
import { whatsappLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Heritage Bites in Pretoria Central: send a message, book a table, ask about catering, or call or WhatsApp us. Find directions and opening hours.',
  alternates: { canonical: '/contact' },
};

/** Links from the home page open the form with a topic chosen. Anything else starts a general enquiry. */
function topicFrom(value: string | undefined): ContactTopic {
  return value === 'table' || value === 'catering' ? value : 'general';
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const params = await searchParams;
  const settings = getSiteSettings();
  const contact = settings.contact;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`;
  return (
    <>
      <PageHeader kicker="Contact" script="We would love to hear from you" title="Contact Heritage Bites">
        Questions, catering or a table booking? Send us a message, or reach us directly on WhatsApp or by phone.
      </PageHeader>

      <section className="container-hb py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <ContactForm initialTopic={topicFrom(params.topic)} />

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
          </aside>
        </div>

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
