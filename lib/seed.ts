import type { DatabaseSync } from 'node:sqlite';
import { get, run, tx } from './db';
import { DEFAULT_SETTINGS, SEED_CATEGORIES, SEED_ITEMS, SEED_SPECIALS } from './seed-data';

/** Inserts the starting menu once (when the database is empty) and default settings if missing. */
export function seedIfEmpty(db: DatabaseSync): void {
  const count = get<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM categories')?.n ?? 0;
  const now = new Date().toISOString();
  if (count === 0) {
    tx(db, () => {
      for (const c of SEED_CATEGORIES) {
        run(
          db,
          'INSERT INTO categories (id, name, tagline, description, sort) VALUES (?, ?, ?, ?, ?)',
          c.id,
          c.name,
          c.tagline,
          c.description,
          c.sort,
        );
      }
      for (const item of SEED_ITEMS) {
        run(
          db,
          `INSERT INTO items (id, category_id, name, subtitle, description, story, price_cents, images, tags,
            spice, vegetarian, prep_minutes, available, featured, sort, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
          item.id,
          item.categoryId,
          item.name,
          item.subtitle,
          item.description,
          item.story,
          item.priceCents,
          JSON.stringify(item.images),
          JSON.stringify(item.tags),
          item.spice ?? 0,
          item.vegetarian ? 1 : 0,
          item.prepMinutes,
          item.featured ? 1 : 0,
          item.sort,
          now,
        );
      }
      for (const s of SEED_SPECIALS) {
        run(
          db,
          `INSERT INTO specials (id, title, description, item_id, price_cents, weekday, window_start, window_end, active, sort)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          s.id,
          s.title,
          s.description,
          s.itemId,
          s.priceCents,
          s.weekday,
          s.windowStart,
          s.windowEnd,
          s.sort,
        );
      }
    });
  }
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    run(db, 'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', key, JSON.stringify(value));
  }
}
