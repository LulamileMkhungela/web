import type { NextRequest } from 'next/server';
import { isStaffRequest } from '@/lib/auth';
import { listMessages } from '@/lib/messages';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  return ok({ messages: listMessages(300) });
}
