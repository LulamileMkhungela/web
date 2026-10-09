import { all, getDb, run } from './db';
import { newId } from './ids';
import type { MessageType, MessageView } from './types';

export type { MessageView };

export function saveMessage(input: {
  type: MessageType;
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  details: Record<string, string>;
}): string {
  const db = getDb();
  const id = newId();
  run(
    db,
    'INSERT INTO messages (id, type, name, email, phone, subject, body, details, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id,
    input.type,
    input.name,
    input.email,
    input.phone,
    input.subject,
    input.body,
    JSON.stringify(input.details),
    'new',
    new Date().toISOString(),
  );
  return id;
}

export function listMessages(limit = 300): MessageView[] {
  const db = getDb();
  const rows = all<{
    id: string;
    type: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    body: string;
    details: string;
    status: string;
    created_at: string;
  }>(db, 'SELECT * FROM messages ORDER BY created_at DESC LIMIT ?', limit);
  return rows.map((r) => {
    let details: Record<string, string> = {};
    try {
      details = JSON.parse(r.details) as Record<string, string>;
    } catch {
      details = {};
    }
    return {
      id: r.id,
      type: r.type as MessageType,
      name: r.name,
      email: r.email,
      phone: r.phone,
      subject: r.subject,
      body: r.body,
      details,
      status: r.status === 'handled' ? 'handled' : 'new',
      createdAt: r.created_at,
    };
  });
}

export function setMessageStatus(id: string, status: 'new' | 'handled'): void {
  run(getDb(), 'UPDATE messages SET status = ? WHERE id = ?', status, id);
}
