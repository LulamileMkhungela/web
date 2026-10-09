import type { NextRequest } from 'next/server';
import { isStaffRequest } from '@/lib/auth';
import { getDb, get, run } from '@/lib/db';
import { getItem, getSpecial } from '@/lib/menu';
import { fail, firstIssue, ok, readJson } from '@/lib/http';
import { specialPatchSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  const { id } = await context.params;
  if (!getSpecial(id)) return fail('That special could not be found.', 404);
  const parsed = specialPatchSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  const p = parsed.data;
  if (p.itemId && !getItem(p.itemId)) return fail('Choose a dish from the menu for this special.', 422);
  const db = getDb();
  const sets: string[] = [];
  const values: (string | number | null)[] = [];
  const map: [keyof typeof p, string, (v: unknown) => string | number | null][] = [
    ['title', 'title', (v) => String(v)],
    ['description', 'description', (v) => String(v)],
    ['itemId', 'item_id', (v) => (v === null ? null : String(v))],
    ['priceCents', 'price_cents', (v) => (v === null ? null : Number(v))],
    ['weekday', 'weekday', (v) => (v === null ? null : Number(v))],
    ['windowStart', 'window_start', (v) => (v === null ? null : String(v))],
    ['windowEnd', 'window_end', (v) => (v === null ? null : String(v))],
    ['active', 'active', (v) => (v ? 1 : 0)],
    ['sort', 'sort', (v) => Number(v)],
  ];
  for (const [key, column, convert] of map) {
    if (p[key] !== undefined) {
      sets.push(`${column} = ?`);
      values.push(convert(p[key]));
    }
  }
  if (sets.length) {
    run(db, `UPDATE specials SET ${sets.join(', ')} WHERE id = ?`, ...values, id);
  }
  return ok({ special: getSpecial(id) });
}

export function DELETE(request: NextRequest, context: Ctx) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  return context.params.then(({ id }) => {
    const exists = get<{ id: string }>(getDb(), 'SELECT id FROM specials WHERE id = ?', id);
    if (!exists) return fail('That special could not be found.', 404);
    run(getDb(), 'DELETE FROM specials WHERE id = ?', id);
    return ok({ ok: true });
  });
}
