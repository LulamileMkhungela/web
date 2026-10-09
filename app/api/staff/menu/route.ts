import type { NextRequest } from 'next/server';
import { isStaffRequest } from '@/lib/auth';
import { listCategories } from '@/lib/menu';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  return ok({ categories: listCategories() });
}
