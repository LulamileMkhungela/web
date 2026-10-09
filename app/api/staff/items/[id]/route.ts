import type { NextRequest } from 'next/server';
import { isStaffRequest } from '@/lib/auth';
import { getDb, run } from '@/lib/db';
import { getItem } from '@/lib/menu';
import { fail, firstIssue, ok, readJson } from '@/lib/http';
import { itemPatchSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  const { id } = await context.params;
  if (!getItem(id)) return fail('That dish could not be found.', 404);
  const parsed = itemPatchSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  const db = getDb();
  const now = new Date().toISOString();
  const patch = parsed.data;
  if (patch.available !== undefined) run(db, 'UPDATE items SET available = ?, updated_at = ? WHERE id = ?', patch.available ? 1 : 0, now, id);
  if (patch.priceCents !== undefined) run(db, 'UPDATE items SET price_cents = ?, updated_at = ? WHERE id = ?', patch.priceCents, now, id);
  if (patch.description !== undefined) run(db, 'UPDATE items SET description = ?, updated_at = ? WHERE id = ?', patch.description, now, id);
  return ok({ item: getItem(id) });
}
