import type { NextRequest } from 'next/server';
import { listItems } from '@/lib/menu';
import { searchItems } from '@/lib/search';
import { ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').slice(0, 80);
  const matches = searchItems(listItems(), query, 8);
  return ok({
    query,
    items: matches.map((item) => ({
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      priceCents: item.priceCents,
      image: item.images[0] ?? '',
      available: item.available,
      categoryName: item.categoryName,
    })),
  });
}
