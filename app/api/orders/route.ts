import { createOrder, OrderError } from '@/lib/orders';
import { fail, firstIssue, ok, readJson } from '@/lib/http';
import { orderSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  const data = parsed.data;
  try {
    const created = createOrder({
      channel: data.channel,
      fulfilment: data.fulfilment,
      pickup: data.pickup,
      customer: data.customer,
      notes: data.notes ?? '',
      lines: data.lines,
      payment: { method: data.payment.method, card: data.payment.card },
      expectedTotalCents: data.expectedTotalCents,
    });
    return ok(created, 201);
  } catch (error) {
    if (error instanceof OrderError) return fail(error.message, error.status, error.extra);
    console.error(error);
    return fail('We could not place your order just now. Please try again.', 500);
  }
}
