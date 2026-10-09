import type { MenuItem } from './types';

// Everyday words and dish synonyms that customers actually type.
const SYNONYMS: { terms: string[]; itemIds: string[] }[] = [
  { terms: ['tripe', 'beef tripe', 'mala', 'stomach', 'mogodu'], itemIds: ['mogodu-samp', 'mogodu-samp-cabbage'] },
  { terms: ['fat cake', 'fatcake', 'fat cakes', 'amagwinya', 'vetkoek', 'magwinya'], itemIds: ['magwinya'] },
  { terms: ['porridge', 'sorghum', 'mabele', 'motogo', 'breakfast'], itemIds: ['motogo-mabele'] },
  { terms: ['trotter', 'trotters', 'feet', 'tlhakwana'], itemIds: ['tlhakwana'] },
  { terms: ['pounded', 'tshotlo'], itemIds: ['tshotlo-pap', 'pap-cabbage-tshotlo'] },
  { terms: ['samp', 'beans', 'sugar beans'], itemIds: ['samp-beans', 'mogodu-samp'] },
  { terms: ['kota', 'bunny', 'quarter loaf', 'sphatlo', 'soweto'], itemIds: ['sphatlo-kota'] },
  { terms: ['russian', 'russians', 'sausage', 'polony'], itemIds: ['russian-chips'] },
  { terms: ['chips', 'fries', 'slap chips'], itemIds: ['fried-chips', 'russian-chips'] },
  { terms: ['wings', 'chicken', 'hardbody', 'hard body', 'braai chicken'], itemIds: ['chicken-wings', 'chicken-hardbody'] },
  { terms: ['ribs', 'short rib', 'short ribs', 'braai', 'beef'], itemIds: ['beef-short-rib'] },
  { terms: ['relish', 'chakalaka', 'spicy', 'spice'], itemIds: ['chakalaka'] },
  { terms: ['pickle', 'pickles', 'atchar', 'atchaar'], itemIds: ['atchaar'] },
  { terms: ['pap', 'maize', 'mielie', 'cabbage', 'braised cabbage'], itemIds: ['pap', 'pap-cabbage-tshotlo', 'braised-cabbage'] },
  { terms: ['dumpling', 'dumplings', 'steamed bread', 'dombolo'], itemIds: ['steamed-dumplings'] },
  { terms: ['salsa', 'tomato', 'onion'], itemIds: ['house-salsa'] },
  { terms: ['vegetarian', 'veggie', 'veg'], itemIds: [] },
];

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9& ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Ranked search across names, descriptions, tags, categories and dish synonyms. */
export function searchItems(items: MenuItem[], query: string, limit = 8): MenuItem[] {
  const q = normalise(query);
  if (!q) return [];
  const tokens = q.split(' ').filter((t) => t.length > 1);
  const synonymIds = new Set<string>();
  for (const group of SYNONYMS) {
    if (group.terms.some((term) => q.includes(term) || term.includes(q))) {
      group.itemIds.forEach((id) => synonymIds.add(id));
    }
  }
  if (q.includes('vegetarian') || q.includes('veggie')) {
    items.filter((i) => i.vegetarian).forEach((i) => synonymIds.add(i.id));
  }

  const scored = items
    .map((item) => {
      const name = normalise(item.name);
      const body = normalise([item.subtitle, item.description, item.categoryName, ...item.tags].join(' '));
      let score = 0;
      if (name.includes(q)) score += 12;
      for (const token of tokens) {
        if (name.includes(token)) score += 5;
        else if (body.includes(token)) score += 2;
      }
      if (synonymIds.has(item.id)) score += 8;
      if (score > 0 && item.featured) score += 0.5;
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.sort - b.item.sort);

  return scored.slice(0, limit).map((row) => row.item);
}
