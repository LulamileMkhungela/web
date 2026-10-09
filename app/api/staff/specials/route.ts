import type { NextRequest } from 'next/server';
import { isStaffRequest } from '@/lib/auth';
import { getDb, run } from '@/lib/db';
import { newId } from '@/lib/ids';
import { getItem, listSpecials } from '@/lib/menu';
import { fail, firstIssue, ok, readJson } from '@/lib/http';
import { specialSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  return ok({ specials: listSpecials() });
}

export async function POST(request: NextRequest) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  const parsed = specialSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  const data = parsed.data;
  if (data.itemId && !getItem(data.itemId)) return fail('Choose a dish from the menu for this special.', 422);
  const id = newId();
  run(
    getDb(),
    `INSERT INTO specials (id, title, description, item_id, price_cents, weekday, window_start, window_end, active, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    data.title,
    data.description ?? '',
    data.itemId ?? null,
    data.priceCents ?? null,
    data.weekday ?? null,
    data.windowStart ?? null,
    data.windowEnd ?? null,
    data.active === false ? 0 : 1,
    data.sort ?? 0,
  );
  return ok({ id }, 201);
}
