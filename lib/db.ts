// SQLite persistence using Node's built-in node:sqlite (no native build step).
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { seedIfEmpty } from './seed';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  story TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  spice INTEGER NOT NULL DEFAULT 0,
  vegetarian INTEGER NOT NULL DEFAULT 0,
  prep_minutes INTEGER NOT NULL DEFAULT 10,
  available INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS specials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  item_id TEXT REFERENCES items(id),
  price_cents INTEGER,
  weekday INTEGER,
  window_start TEXT,
  window_end TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  fulfilment TEXT NOT NULL DEFAULT 'collection',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL DEFAULT '',
  customer_email TEXT NOT NULL DEFAULT '',
  pickup_at TEXT,
  eta_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  subtotal_cents INTEGER NOT NULL,
  vat_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  card_brand TEXT NOT NULL DEFAULT '',
  card_last4 TEXT NOT NULL DEFAULT '',
  payment_ref TEXT NOT NULL DEFAULT '',
  external_ref TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  line_key TEXT NOT NULL,
  name TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  line_total_cents INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS order_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS yoco_checkouts (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS staff_sessions (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
`;

export type SqlParam = string | number | null;

type Statement = {
  all: (...params: SqlParam[]) => unknown[];
  get: (...params: SqlParam[]) => unknown;
  run: (...params: SqlParam[]) => { changes: number | bigint; lastInsertRowid: number | bigint };
};

function prepare(db: DatabaseSync, sql: string): Statement {
  return db.prepare(sql) as unknown as Statement;
}

export function all<T>(db: DatabaseSync, sql: string, ...params: SqlParam[]): T[] {
  return prepare(db, sql).all(...params) as T[];
}

export function get<T>(db: DatabaseSync, sql: string, ...params: SqlParam[]): T | undefined {
  return prepare(db, sql).get(...params) as T | undefined;
}

export function run(db: DatabaseSync, sql: string, ...params: SqlParam[]) {
  return prepare(db, sql).run(...params);
}

export function tx<T>(db: DatabaseSync, fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __heritageBitesDb: DatabaseSync | undefined;
}

export function getDb(): DatabaseSync {
  if (globalThis.__heritageBitesDb) return globalThis.__heritageBitesDb;
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'heritage-bites.db');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
  seedIfEmpty(db);
  globalThis.__heritageBitesDb = db;
  return db;
}
