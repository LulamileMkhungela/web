import { NextResponse } from 'next/server';
import { endStaffSession, readCookie, STAFF_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export function POST(request: Request) {
  endStaffSession(readCookie(request.headers.get('cookie'), STAFF_COOKIE));
  const response = NextResponse.json({ ok: true });
  response.cookies.set(STAFF_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
