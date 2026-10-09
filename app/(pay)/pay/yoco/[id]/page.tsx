import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { YocoSimulator } from '@/components/payments/YocoSimulator';
import { getYocoCheckout } from '@/lib/payments';
import { formatZAR } from '@/lib/money';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Secure checkout (simulated)',
  robots: { index: false, follow: false },
};

export default async function YocoCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^yco_[a-f0-9]{24}$/.test(id)) notFound();
  const checkout = getYocoCheckout(id);
  if (!checkout) notFound();

  return (
    <main id="main" className="mx-auto flex min-h-screen w-full max-w-[980px] flex-col justify-center gap-8 px-5 py-14 sm:px-8">
      <div role="note" className="rounded-2xl border border-ochre/40 bg-ochre-wash px-5 py-4 text-sm font-semibold text-navy">
        Simulated Yoco-style checkout for this demo build. It is not affiliated with Yoco and nothing is charged.
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="card flex flex-col gap-6 p-8">
          <p className="kicker">Pay Heritage Bites</p>
          <p className="font-display text-5xl font-bold text-navy">{formatZAR(checkout.amountCents, true)}</p>
          <p className="text-sm">
            Order {`HB-${checkout.orderNumber}`} for {checkout.customerName}
          </p>
          <ul className="grid gap-2 border-t border-navy/10 pt-5 text-sm">
            {checkout.itemSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
        <YocoSimulator checkoutId={checkout.id} status={checkout.status} amountLabel={formatZAR(checkout.amountCents, true)} />
      </div>
    </main>
  );
}
