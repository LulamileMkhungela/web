import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { BRAND } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Terms of Use & Ordering',
  description: 'Terms for ordering from Heritage Bites online, by WhatsApp or through delivery apps.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader kicker="Legal" title="Terms of use &amp; ordering" />
      <article className="mx-auto w-full max-w-[860px] px-5 py-16 sm:px-8 md:py-20">
        <div className="grid gap-6 leading-[1.85]">
          <h2 className="text-2xl font-bold text-navy">Prices and VAT</h2>
          <p>All prices shown are in South African rand and include VAT at 15%. Prices may change, and your basket is checked again before you pay.</p>
          <h2 className="text-2xl font-bold text-navy">Ordering and pickup</h2>
          <p>
            Orders placed on this site are for collection or dine-in at {BRAND.street}, {BRAND.suburb}. We confirm each
            order on the order tracking page. A pickup time is a target: we will contact you if we cannot meet it.
          </p>
          <h2 className="text-2xl font-bold text-navy">Payment</h2>
          <p>
            This build is a demonstration. Debit card and Yoco payments are simulated, and nothing is charged. Once the
            live payment keys are connected, the same checkout will take real payments.
          </p>
          <h2 className="text-2xl font-bold text-navy">Delivery</h2>
          <p>Delivery is provided through Uber Eats and Mr D, under their own terms. Heritage Bites does not run its own delivery service.</p>
          <h2 className="text-2xl font-bold text-navy">Allergies and dietary needs</h2>
          <p>Please tell us about allergies or dietary needs in the order notes or by phone before you order.</p>
          <h2 className="text-2xl font-bold text-navy">Problems with your order</h2>
          <p>If something is wrong with your order, contact us straight away on WhatsApp or by phone so that we can put it right.</p>
          <h2 className="text-2xl font-bold text-navy">Changes to these terms</h2>
          <p>We may update these terms from time to time. The version on this page applies. These terms should be reviewed by a legal adviser before launch.</p>
        </div>
      </article>
    </>
  );
}
