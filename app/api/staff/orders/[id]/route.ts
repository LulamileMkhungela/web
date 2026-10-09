import type { NextRequest } from 'next/server';
import { isStaffRequest } from '@/lib/auth';
import { OrderError, setOrderStatus } from '@/lib/orders';
import { fail, firstIssue, ok, readJson } from '@/lib/http';
import { orderStatusSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  const { id } = await context.params;
  const parsed = orderStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  try {
    const order = setOrderStatus(id, parsed.data.status, parsed.data.note ?? '');
    return ok({ order });
  } catch (error) {
    if (error instanceof OrderError) return fail(error.message, error.status);
    throw error;
  }
}
