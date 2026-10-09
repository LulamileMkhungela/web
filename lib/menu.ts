import { all, get, getDb } from './db';
import type { MenuCategory, MenuItem, SpecialView } from './types';

type ItemRow = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  story: string;
  category_id: string;
  category_name: string;
  price_cents: number;
  images: string;
  tags: string;
  spice: number;
  vegetarian: number;
  prep_minutes: number;
  available: number;
  featured: number;
  sort: number;
};

type CategoryRow = { id: string; name: string; tagline: string; description: string; sort: number };

type SpecialRow = {
  id: string;
  title: string;
  description: string;
  item_id: string | null;
  price_cents: number | null;
  weekday: number | null;
  window_start: string | null;
  window_end: string | null;
  active: number;
  sort: number;
  item_name: string | null;
  item_price_cents: number | null;
  item_images: string | null;
  item_available: number | null;
};

const ITEM_SELECT = `SELECT i.*, c.name AS category_name FROM items i JOIN categories c ON c.id = i.category_id`;

function parseList(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function mapItem(row: ItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    description: row.description,
    story: row.story,
    categoryId: row.category_id,
    categoryName: row.category_name,
    priceCents: row.price_cents,
    images: parseList(row.images),
    tags: parseList(row.tags),
    spice: row.spice,
    vegetarian: row.vegetarian === 1,
    prepMinutes: row.prep_minutes,
    available: row.available === 1,
    featured: row.featured === 1,
    sort: row.sort,
  };
}

export function listItems(): MenuItem[] {
  const db = getDb();
  return all<ItemRow>(db, `${ITEM_SELECT} ORDER BY c.sort, i.sort`).map(mapItem);
}

export function getItem(id: string): MenuItem | undefined {
  const db = getDb();
  const row = get<ItemRow>(db, `${ITEM_SELECT} WHERE i.id = ?`, id);
  return row ? mapItem(row) : undefined;
}

export function listCategories(): MenuCategory[] {
  const db = getDb();
  const categories = all<CategoryRow>(db, 'SELECT * FROM categories ORDER BY sort');
  const items = listItems();
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    tagline: c.tagline,
    description: c.description,
    sort: c.sort,
    items: items.filter((i) => i.categoryId === c.id),
  }));
}

function mapSpecial(row: SpecialRow): SpecialView {
  const images = row.item_images ? parseList(row.item_images) : [];
  const regular = row.item_price_cents ?? 0;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    itemId: row.item_id,
    itemName: row.item_name ?? '',
    itemImage: images[0] ?? '',
    priceCents: row.price_cents ?? regular,
    regularPriceCents: regular,
    weekday: row.weekday,
    windowStart: row.window_start,
    windowEnd: row.window_end,
    active: row.active === 1,
    sort: row.sort,
    available: row.item_available === 1,
  };
}

const SPECIAL_SELECT = `
  SELECT s.*, i.name AS item_name, i.price_cents AS item_price_cents, i.images AS item_images, i.available AS item_available
  FROM specials s LEFT JOIN items i ON i.id = s.item_id`;

export function listSpecials(): SpecialView[] {
  const db = getDb();
  return all<SpecialRow>(db, `${SPECIAL_SELECT} ORDER BY s.sort, s.title`).map(mapSpecial);
}

export function getSpecial(id: string): SpecialView | undefined {
  const db = getDb();
  const row = get<SpecialRow>(db, `${SPECIAL_SELECT} WHERE s.id = ?`, id);
  return row ? mapSpecial(row) : undefined;
}
