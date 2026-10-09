import type { NextRequest } from 'next/server';
import { isStaffRequest } from '@/lib/auth';
import { getSiteSettings, saveSetting } from '@/lib/settings';
import { fail, firstIssue, ok, readJson } from '@/lib/http';
import { settingsSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  return ok({ settings: getSiteSettings() });
}

export async function PUT(request: NextRequest) {
  if (!isStaffRequest(request)) return fail('Please sign in to the staff console.', 401);
  const parsed = settingsSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  const data = parsed.data;
  if (data.hours) saveSetting('hours', data.hours);
  if (data.storeLinks) saveSetting('storeLinks', data.storeLinks);
  if (data.prep) saveSetting('prep', data.prep);
  if (data.contact) saveSetting('contact', data.contact);
  if (data.checklist) saveSetting('checklist', data.checklist);
  return ok({ settings: getSiteSettings() });
}
