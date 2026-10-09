import type { NextRequest } from 'next/server';
import { isStaffRequest } from '@/lib/auth';
import { setMessageStatus } from '@/lib/messages';
import { fail, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  const { id } = await context.params;
  const body = (await readJson(request)) as { status?: string } | null;
  const status = body?.status === 'handled' ? 'handled' : 'new';
  setMessageStatus(id, status);
  return ok({ ok: true, status });
}
