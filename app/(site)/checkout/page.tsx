import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
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
      <section className="grain relative overflow-hidden bg-navy text-cream">
        <div className="mx-auto w-full max-w-[1240px] px-5 pb-14 pt-14 sm:px-8">
          <p className="kicker kicker-light">Checkout</p>
          <h1 className="mt-3 text-[clamp(2.4rem,4.4vw,3.6rem)] font-bold text-cream">Almost there</h1>
          <p className="mt-4 max-w-2xl text-cream/80">
            Choose how you want to order, pick a time, and pay. Prices include VAT and are checked again when you place
            the order.
          </p>
        </div>
        <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
      </section>
      <section className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-8">
        <CheckoutForm
          pickupOptions={options}
          isOpen={status.isOpen}
          statusDetail={status.detail}
          initialChannel={params.channel === 'whatsapp' ? 'whatsapp' : 'website'}
          cancelled={params.cancelled === '1'}
          waNumber={settings.contact.whatsapp}
          etaMinutes={etaMinutes}
          storeLinks={settings.storeLinks}
        />
      </section>
    </>
  );
}
