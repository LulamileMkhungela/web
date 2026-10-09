// Staff console sessions. The browser holds "<sessionId>.<signature>" in an HttpOnly cookie.
// Sessions live in the database, so signing out really ends that session on the server.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { get, getDb, run } from './db';

export const STAFF_COOKIE = 'hb_staff';
const SESSION_HOURS = 12;

function secret(): string {
  return process.env.STAFF_SESSION_SECRET || 'heritage-bites-demo-secret-change-me';
}

function sign(sessionId: string): string {
  return createHmac('sha256', secret()).update(`staff-session:${sessionId}`).digest('base64url');
}

export function createStaffSession(now: number = Date.now()): string {
  const db = getDb();
  run(db, 'DELETE FROM staff_sessions WHERE expires_at < ?', now);
  const id = randomBytes(18).toString('base64url');
  run(db, 'INSERT INTO staff_sessions (id, expires_at) VALUES (?, ?)', id, now + SESSION_HOURS * 3600 * 1000);
  return `${id}.${sign(id)}`;
}

export function isValidStaffSession(value: string | undefined | null): boolean {
  if (!value) return false;
  const [id, signature] = value.split('.');
  if (!id || !signature) return false;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  const row = get<{ expires_at: number }>(getDb(), 'SELECT expires_at FROM staff_sessions WHERE id = ?', id);
  return Boolean(row && row.expires_at > Date.now());
}

/** Ends one session on the server (used by sign-out). */
export function endStaffSession(value: string | undefined | null): void {
  const [id] = (value ?? '').split('.');
  if (id) run(getDb(), 'DELETE FROM staff_sessions WHERE id = ?', id);
}

export function checkStaffPin(pin: string): boolean {
  const expected = Buffer.from(process.env.STAFF_PIN || '1234');
  const given = Buffer.from(pin);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function staffCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  };
}

export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export function isStaffRequest(request: Request): boolean {
  return isValidStaffSession(readCookie(request.headers.get('cookie'), STAFF_COOKIE));
}
