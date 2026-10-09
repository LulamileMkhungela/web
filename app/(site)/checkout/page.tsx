import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PageHeader } from '@/components/site/PageHeader';
import { kitchenEtaMinutes } from '@/lib/kitchen';
import { getSiteSettings } from '@/lib/settings';
import { openStatus, pickupOptions } from '@/lib/time';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  const settings = getSiteSettings();
  const status = openStatus(settings.hours);
  const etaMinutes = kitchenEtaMinutes();
  const options = pickupOptions(settings.hours, etaMinutes);
  return (
    <>
      <PageHeader kicker="Checkout" title="Almost there">
        Check your order, choose a collection time and pay on this page. Prices include VAT.
      </PageHeader>
      <section className="container-hb py-12 md:py-16">
        <CheckoutForm
          pickupOptions={options}
          isOpen={status.isOpen}
          statusDetail={status.detail}
          initialChannel={params.channel === 'whatsapp' ? 'whatsapp' : 'website'}
          cancelled={params.cancelled === '1'}
          etaMinutes={etaMinutes}
          storeLinks={settings.storeLinks}
        />
      </section>
    </>
  );
}
