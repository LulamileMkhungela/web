import { getOrderByToken } from '@/lib/orders';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!/^[A-Za-z0-9_-]{10,80}$/.test(token)) return fail('Order not found', 404);
  const order = getOrderByToken(token);
  if (!order) return fail('Order not found', 404);
  return ok({ order });
}
