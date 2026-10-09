import { NextResponse } from 'next/server';
import { checkStaffPin, createStaffSession, staffCookieOptions, STAFF_COOKIE } from '@/lib/auth';
import { fail, firstIssue, readJson } from '@/lib/http';
import { staffLoginSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const parsed = staffLoginSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  if (!checkStaffPin(parsed.data.pin)) return fail('That PIN is not correct.', 401);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(STAFF_COOKIE, createStaffSession(), staffCookieOptions());
  return response;
}
