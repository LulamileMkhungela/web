import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { PrintButton } from '@/components/staff/PrintButton';
import { isValidStaffSession, STAFF_COOKIE } from '@/lib/auth';
import { getOrderById } from '@/lib/orders';
import { formatZAR } from '@/lib/money';
import { CHANNEL_LABEL, PAYMENT_METHOD_LABEL } from '@/lib/status';
import { formatSAST } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  if (!isValidStaffSession(jar.get(STAFF_COOKIE)?.value)) redirect('/staff/login');
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();

  return (
    <main className="mx-auto w-full max-w-[380px] bg-white px-6 py-8 font-mono text-[13px] leading-snug text-black">
      <div className="no-print mb-6 flex items-center justify-between gap-3 font-sans">
        <PrintButton />
      </div>
      <h1 className="text-center text-base font-bold">HERITAGE BITES</h1>
      <p className="text-center">323 Sisulu St, Pretoria Central</p>
      <hr className="my-3 border-dashed border-black" />
      <p className="text-center text-2xl font-bold">{order.displayNumber}</p>
      <p className="text-center">{CHANNEL_LABEL[order.channel]} · {order.fulfilment === 'dine_in' ? 'DINE-IN' : 'COLLECTION'}</p>
      <p className="text-center">Placed {formatSAST(order.createdAt)}</p>
      <p className="text-center font-bold">
        {order.pickupAt ? `PICKUP ${formatSAST(order.pickupAt)}` : 'PICKUP AS SOON AS POSSIBLE'}
      </p>
      <hr className="my-3 border-dashed border-black" />
      <p>Customer: {order.customerName}</p>
      {order.customerPhone ? <p>Phone: {order.customerPhone}</p> : null}
      <hr className="my-3 border-dashed border-black" />
      <ul className="grid gap-2">
        {order.lines.map((line) => (
          <li key={line.key} className="flex justify-between gap-3">
            <span>
              {line.qty} x {line.name}
            </span>
            <span>{formatZAR(line.lineTotalCents, true)}</span>
          </li>
        ))}
      </ul>
      <hr className="my-3 border-dashed border-black" />
      <p className="flex justify-between">
        <span>Subtotal ex VAT</span>
        <span>{formatZAR(order.subtotalCents, true)}</span>
      </p>
      <p className="flex justify-between">
        <span>VAT 15%</span>
        <span>{formatZAR(order.vatCents, true)}</span>
      </p>
      <p className="flex justify-between text-base font-bold">
        <span>TOTAL</span>
        <span>{formatZAR(order.totalCents, true)}</span>
      </p>
      <p className="mt-2">{PAYMENT_METHOD_LABEL[order.paymentMethod]} · {order.paymentStatus.replace(/_/g, ' ')}</p>
      {order.cardLast4 ? <p>{order.cardBrand} ending {order.cardLast4} (demo)</p> : null}
      {order.notes ? (
        <>
          <hr className="my-3 border-dashed border-black" />
          <p className="font-bold">NOTES: {order.notes}</p>
        </>
      ) : null}
      <hr className="my-3 border-dashed border-black" />
      <p className="text-center">Thank you for eating with us</p>
    </main>
  );
}
