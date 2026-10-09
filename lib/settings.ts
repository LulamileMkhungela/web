import { getDb, get, run } from './db';
import { DEFAULT_SETTINGS } from './seed-data';
import type { Checklist, ContactSettings, Hours, PrepSettings, SiteSettings, SocialLinks, StoreLinks } from './types';

type SettingKey = keyof typeof DEFAULT_SETTINGS;

function read<K extends SettingKey>(key: K): (typeof DEFAULT_SETTINGS)[K] {
  const db = getDb();
  const row = get<{ value: string }>(db, 'SELECT value FROM settings WHERE key = ?', key);
  if (!row) return DEFAULT_SETTINGS[key];
  try {
    return JSON.parse(row.value) as (typeof DEFAULT_SETTINGS)[K];
  } catch {
    return DEFAULT_SETTINGS[key];
  }
}

export function getSiteSettings(): SiteSettings {
  return {
    hours: read('hours') as Hours,
    storeLinks: read('storeLinks') as StoreLinks,
    social: read('social') as SocialLinks,
    prep: read('prep') as PrepSettings,
    contact: read('contact') as ContactSettings,
    checklist: read('checklist') as Checklist,
  };
}

export function saveSetting(key: SettingKey, value: unknown): void {
  const db = getDb();
  run(
    db,
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    JSON.stringify(value),
  );
}
