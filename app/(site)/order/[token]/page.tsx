import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OrderTracker } from '@/components/order/OrderTracker';
import { listItems, listSpecials } from '@/lib/menu';
import { getOrderByToken } from '@/lib/orders';
import { getSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Track your order',
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{10,80}$/.test(token)) notFound();
  const order = getOrderByToken(token);
  if (!order) notFound();

  const settings = getSiteSettings();
  const imageByKey: Record<string, string> = {};
  for (const item of listItems()) imageByKey[`item:${item.id}`] = item.images[0] ?? '';
  for (const special of listSpecials()) imageByKey[`special:${special.id}`] = special.itemImage;

  return (
    <>
      <section className="grain relative overflow-hidden bg-navy text-cream no-print">
        <div className="mx-auto w-full max-w-[1240px] px-5 pb-14 pt-14 sm:px-8">
          <p className="kicker kicker-light">Order tracking</p>
          <p className="mt-3 font-display text-[clamp(2.2rem,4vw,3.4rem)] font-bold text-cream">Thank you, {order.customerName}</p>
          <p className="mt-3 max-w-2xl text-cream/80">Keep this page open or bookmark it to follow your order.</p>
        </div>
        <div aria-hidden="true" className="band-zigzag absolute inset-x-0 bottom-0 opacity-75" />
      </section>
      <section className="mx-auto w-full max-w-[1240px] px-5 py-14 sm:px-8">
        <OrderTracker order={order} imageByKey={imageByKey} waNumber={settings.contact.whatsapp} />
      </section>
    </>
  );
}
