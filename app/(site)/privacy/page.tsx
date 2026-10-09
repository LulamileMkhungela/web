import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { BRAND } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description: 'How Heritage Bites uses the personal information you give us for orders, enquiries and specials.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader kicker="Legal" title="Privacy notice" />
      <article className="mx-auto w-full max-w-[860px] px-5 py-16 sm:px-8 md:py-20">
        <div className="grid gap-6 leading-[1.85]">
          <p>
            {BRAND.name} respects your privacy. This notice explains what personal information we collect when you place
            an order, send an enquiry or subscribe to specials, and why we use it.
          </p>
          <h2 className="pt-4 text-2xl font-bold text-navy">What we collect</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Your name and mobile number, so we can prepare and confirm your order.</li>
            <li>An email address, if you give one, for receipts and specials.</li>
            <li>Your order details, pickup time and notes.</li>
            <li>
              For card payments: only the card brand and the last four digits, for your receipt. Full card numbers,
              expiry dates and security codes are not stored by this site. (This build is a demo, so no real card
              payments are taken.)
            </li>
            <li>Enquiries you send through the contact forms.</li>
          </ul>
          <h2 className="pt-4 text-2xl font-bold text-navy">How we use it</h2>
          <p>We use your information to fulfil your order, answer your enquiry and, only if you agree, send weekly specials. We do not sell your personal information.</p>
          <h2 className="pt-4 text-2xl font-bold text-navy">Your choices</h2>
          <p>
            You can unsubscribe from specials at any time, and you can ask us to correct or delete your information by
            contacting us at {BRAND.email} or on {BRAND.phoneDisplay}.
          </p>
          <h2 className="pt-4 text-2xl font-bold text-navy">Protection of personal information</h2>
          <p>
            We handle personal information in line with South Africa’s Protection of Personal Information Act (POPIA).
            This notice is a starting point and should be reviewed by a legal adviser before the site goes live.
          </p>
        </div>
      </article>
    </>
  );
}
