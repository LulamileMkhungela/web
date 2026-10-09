import { ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export function GET() {
  return ok({ ok: true, service: 'heritage-bites', time: new Date().toISOString() });
}
