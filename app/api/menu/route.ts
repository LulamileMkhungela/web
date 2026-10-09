import { listCategories, listSpecials } from '@/lib/menu';
import { ok } from '@/lib/http';
import { specialIsLiveAt } from '@/lib/specials';
import { getSiteSettings } from '@/lib/settings';
import { openStatus } from '@/lib/time';

export const dynamic = 'force-dynamic';

export function GET() {
  const now = new Date();
  const specials = listSpecials()
    .filter((s) => specialIsLiveAt(s, now) && s.available)
    .map((s) => ({ id: s.id, title: s.title, description: s.description, priceCents: s.priceCents, itemName: s.itemName }));
  const status = openStatus(getSiteSettings().hours, now);
  return ok({ categories: listCategories(), liveSpecials: specials, status });
}
