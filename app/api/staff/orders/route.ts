import type { NextRequest } from 'next/server';
import { isStaffRequest } from '@/lib/auth';
import { createStaffOrder, listOrders, OrderError } from '@/lib/orders';
import { fail, firstIssue, ok, readJson } from '@/lib/http';
import { staffOrderSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const SIGN_IN = 'Please sign in to the staff console.';

export function GET(request: NextRequest) {
  if (!isStaffRequest(request)) return fail(SIGN_IN, 401);
  return ok({ orders: listOrders(200), serverTime: new Date().toISOString() });
}

export async function POST(request: Request) {
  if (!isStaffRequest(request)) return fail(SIGN_IN, 401);
  const parsed = staffOrderSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  try {
    const created = createStaffOrder({
      channel: parsed.data.channel,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone ?? '',
      externalRef: parsed.data.externalRef ?? '',
      lines: parsed.data.lines,
      notes: parsed.data.notes ?? '',
    });
    return ok(created, 201);
  } catch (error) {
    if (error instanceof OrderError) return fail(error.message, error.status, error.extra);
    throw error;
  }
}
