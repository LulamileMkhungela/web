import { z } from 'zod';
import { completeYocoCheckout, OrderError } from '@/lib/orders';
import { getYocoCheckout } from '@/lib/payments';
import { fail, firstIssue, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

const actionSchema = z.object({ action: z.enum(['approve', 'cancel']) });

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const checkout = getYocoCheckout(id);
  if (!checkout) return fail('This checkout session has expired.', 404);
  return ok({ checkout });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = actionSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  try {
    const result = completeYocoCheckout(id, parsed.data.action);
    const redirectUrl = result.state === 'cancelled' ? '/checkout?cancelled=1' : `/order/${result.orderToken}`;
    return ok({ redirectUrl, state: result.state });
  } catch (error) {
    if (error instanceof OrderError) return fail(error.message, error.status);
    throw error;
  }
}
