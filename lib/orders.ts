import type { DatabaseSync } from 'node:sqlite';
import { all, get, getDb, run, tx } from './db';
import { newId, newToken } from './ids';
import { getItem, listSpecials } from './menu';
import { specialIsLiveAt } from './specials';
import { getSiteSettings } from './settings';
import { formatSAST, isWithinHours, openStatus } from './time';
import { formatZAR, vatInclusive } from './money';
import { NEXT_STATUSES, PAYMENT_STATUS_LABEL, STATUS_LABEL } from './status';
import { insertYocoCheckout, processDummyCard, type DemoCardInput } from './payments';
import { whatsappLink } from './whatsapp';
import { BRAND, SITE_URL } from './config';
import type {
  Fulfilment,
  OrderChannel,
  OrderStatus,
  OrderView,
  PaymentMethod,
  PaymentStatus,
} from './types';

export class OrderError extends Error {
  status: number;
  extra: Record<string, unknown>;
  constructor(message: string, status = 400, extra: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export type RequestedLine = { key: string; qty: number };

type ResolvedLine = {
  key: string;
  name: string;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
  prepMinutes: number;
};

export function mergeLines(lines: RequestedLine[]): RequestedLine[] {
  const quantities = new Map<string, number>();
  for (const line of lines) quantities.set(line.key, (quantities.get(line.key) ?? 0) + line.qty);
  return [...quantities.entries()].map(([key, qty]) => ({ key, qty }));
}

/** Re-prices every basket line on the server. The browser is never trusted for prices. */
export function resolveLines(lines: RequestedLine[], now: Date): ResolvedLine[] {
  return lines.map((line) => {
    const [kind, ...rest] = line.key.split(':');
    const refId = rest.join(':');
    if (kind === 'item') {
      const item = getItem(refId);
      if (!item) {
        throw new OrderError('A dish in your basket is no longer on the menu. Please review your basket.', 409);
      }
      if (!item.available) {
        throw new OrderError(`${item.name} is sold out right now. Please remove it to continue.`, 409);
      }
      return {
        key: line.key,
        name: item.name,
        unitPriceCents: item.priceCents,
        qty: line.qty,
        lineTotalCents: item.priceCents * line.qty,
        prepMinutes: item.prepMinutes,
      };
    }
    if (kind === 'special') {
      const special = listSpecials().find((s) => s.id === refId);
      if (!special || !specialIsLiveAt(special, now) || !special.available) {
        throw new OrderError('A special in your basket is not available right now. Please review your basket.', 409);
      }
      const item = special.itemId ? getItem(special.itemId) : undefined;
      return {
        key: line.key,
        name: `${special.title}: ${special.itemName}`,
        unitPriceCents: special.priceCents,
        qty: line.qty,
        lineTotalCents: special.priceCents * line.qty,
        prepMinutes: item?.prepMinutes ?? 10,
      };
    }
    throw new OrderError('Your basket has an unknown item. Please review your basket.');
  });
}

export function estimateReadyMinutes(db: DatabaseSync, lines: ResolvedLine[]): number {
  const settings = getSiteSettings();
  const active = get<{ n: number }>(db, "SELECT COUNT(*) AS n FROM orders WHERE status IN ('new','preparing','ready')")?.n ?? 0;
  const longest = Math.max(0, ...lines.map((line) => line.prepMinutes));
  const raw = settings.prep.baseMinutes + settings.prep.perOpenOrderMinutes * active + longest;
  return Math.min(settings.prep.maxMinutes, Math.max(5, raw));
}

export type CreateOrderInput = {
  channel: 'website' | 'whatsapp';
  fulfilment: Fulfilment;
  pickup: string;
  customer: { name: string; phone: string; email: string };
  notes: string;
  lines: RequestedLine[];
  payment: { method: 'card' | 'yoco' | 'counter'; card?: DemoCardInput };
  expectedTotalCents?: number;
};

export type CreatedOrder = {
  id: string;
  token: string;
  number: number;
  displayNumber: string;
  status: OrderStatus;
  totalCents: number;
  redirectUrl: string;
  whatsappUrl: string | null;
};

type OrderRow = {
  id: string;
  number: number;
  token: string;
  channel: string;
  status: string;
  payment_method: string;
  payment_status: string;
  fulfilment: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  pickup_at: string | null;
  eta_at: string | null;
  notes: string;
  subtotal_cents: number;
  vat_cents: number;
  total_cents: number;
  card_brand: string;
  card_last4: string;
  payment_ref: string;
  external_ref: string;
  created_at: string;
  updated_at: string;
};

function loadOrder(db: DatabaseSync, row: OrderRow, personal: boolean): OrderView {
  const lines = all<{ line_key: string; name: string; qty: number; unit_price_cents: number; line_total_cents: number }>(
    db,
    'SELECT line_key, name, qty, unit_price_cents, line_total_cents FROM order_items WHERE order_id = ? ORDER BY id',
    row.id,
  );
  const events = all<{ status: string; note: string; at: string }>(
    db,
    'SELECT status, note, at FROM order_events WHERE order_id = ? ORDER BY id',
    row.id,
  );
  return {
    id: row.id,
    number: row.number,
    displayNumber: `HB-${row.number}`,
    token: row.token,
    channel: row.channel as OrderChannel,
    status: row.status as OrderStatus,
    paymentMethod: row.payment_method as PaymentMethod,
    paymentStatus: row.payment_status as PaymentStatus,
    fulfilment: row.fulfilment as Fulfilment,
    customerName: row.customer_name,
    customerPhone: personal ? row.customer_phone : '',
    customerEmail: personal ? row.customer_email : '',
    pickupAt: row.pickup_at,
    etaAt: row.eta_at,
    notes: row.notes,
    subtotalCents: row.subtotal_cents,
    vatCents: row.vat_cents,
    totalCents: row.total_cents,
    cardBrand: row.card_brand,
    cardLast4: row.card_last4,
    paymentRef: row.payment_ref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lines: lines.map((l) => ({
      key: l.line_key,
      name: l.name,
      qty: l.qty,
      unitPriceCents: l.unit_price_cents,
      lineTotalCents: l.line_total_cents,
    })),
    events: events.map((e) => ({ status: e.status as OrderStatus, note: e.note, at: e.at })),
  };
}

export function getOrderByToken(token: string): OrderView | undefined {
  const db = getDb();
  const row = get<OrderRow>(db, 'SELECT * FROM orders WHERE token = ?', token);
  return row ? loadOrder(db, row, false) : undefined;
}

export function getOrderById(id: string): OrderView | undefined {
  const db = getDb();
  const row = get<OrderRow>(db, 'SELECT * FROM orders WHERE id = ?', id);
  return row ? loadOrder(db, row, true) : undefined;
}

export function listOrders(limit = 200): OrderView[] {
  const db = getDb();
  const rows = all<OrderRow>(db, 'SELECT * FROM orders ORDER BY created_at DESC LIMIT ?', limit);
  return rows.map((row) => loadOrder(db, row, true));
}

function buildWhatsAppMessage(number: number, token: string, lines: ResolvedLine[], totalCents: number, pickup: Date | null, name: string, notes: string): string {
  const itemLines = lines.map((l) => `- ${l.qty} x ${l.name} (${formatZAR(l.lineTotalCents)})`);
  return [
    `Hi ${BRAND.name}, I'd like to place this order (ref HB-${number}):`,
    ...itemLines,
    `Total incl. VAT: ${formatZAR(totalCents, true)}`,
    `Pickup: ${pickup ? `about ${formatSAST(pickup)}` : 'as soon as possible'}`,
    `Name: ${name}`,
    notes ? `Notes: ${notes}` : '',
    `Track my order: ${SITE_URL}/order/${token}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function createOrder(input: CreateOrderInput): CreatedOrder {
  const db = getDb();
  const settings = getSiteSettings();
  const now = new Date();
  const nowIso = now.toISOString();
  const requested = mergeLines(input.lines);

  return tx(db, () => {
    const lines = resolveLines(requested, now);
    const total = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
    if (input.expectedTotalCents !== undefined && input.expectedTotalCents !== total) {
      throw new OrderError(
        `Prices have changed since you added these dishes. The updated total is ${formatZAR(total, true)}. Please review your basket.`,
        409,
        { totalCents: total },
      );
    }

    const readyMinutes = estimateReadyMinutes(db, lines);
    const readyAt = new Date(now.getTime() + readyMinutes * 60000);
    let pickupAt: Date;
    if (input.pickup === 'asap') {
      const status = openStatus(settings.hours, now);
      if (!status.isOpen) {
        throw new OrderError(`We are closed right now (${status.detail}). Please choose a later pickup time.`);
      }
      pickupAt = readyAt;
    } else {
      const chosen = new Date(input.pickup);
      if (Number.isNaN(chosen.getTime())) throw new OrderError('Please choose a valid pickup time.');
      if (chosen.getTime() < now.getTime() + 10 * 60000) {
        throw new OrderError('Please choose a pickup time at least 10 minutes from now.');
      }
      if (!isWithinHours(settings.hours, chosen)) {
        throw new OrderError('Please choose a pickup time within our opening hours.');
      }
      pickupAt = chosen;
    }

    let status: OrderStatus;
    let paymentMethod: PaymentMethod;
    let paymentStatus: PaymentStatus;
    let cardBrand = '';
    let cardLast4 = '';
    let paymentRef = '';
    if (input.channel === 'whatsapp') {
      status = 'new';
      paymentMethod = 'whatsapp';
      paymentStatus = 'pay_on_collection';
    } else if (input.payment.method === 'card') {
      const card = processDummyCard(input.payment.card);
      status = 'new';
      paymentMethod = 'card';
      paymentStatus = 'paid';
      cardBrand = card.brand;
      cardLast4 = card.last4;
      paymentRef = card.ref;
    } else if (input.payment.method === 'yoco') {
      status = 'awaiting_payment';
      paymentMethod = 'yoco';
      paymentStatus = 'awaiting_payment';
    } else {
      status = 'new';
      paymentMethod = 'counter';
      paymentStatus = 'pay_on_collection';
    }

    const number = get<{ n: number }>(db, 'SELECT COALESCE(MAX(number), 1000) + 1 AS n FROM orders')?.n ?? 1001;
    const id = newId();
    const token = newToken();
    const vat = vatInclusive(total);

    run(
      db,
      `INSERT INTO orders (id, number, token, channel, status, payment_method, payment_status, fulfilment,
        customer_name, customer_phone, customer_email, pickup_at, eta_at, notes, subtotal_cents, vat_cents,
        total_cents, card_brand, card_last4, payment_ref, external_ref, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      number,
      token,
      input.channel,
      status,
      paymentMethod,
      paymentStatus,
      input.fulfilment,
      input.customer.name,
      input.customer.phone,
      input.customer.email,
      pickupAt.toISOString(),
      readyAt.toISOString(),
      input.notes,
      total - vat,
      vat,
      total,
      cardBrand,
      cardLast4,
      paymentRef,
      '',
      nowIso,
      nowIso,
    );

    for (const line of lines) {
      run(
        db,
        'INSERT INTO order_items (order_id, line_key, name, unit_price_cents, qty, line_total_cents) VALUES (?, ?, ?, ?, ?, ?)',
        id,
        line.key,
        line.name,
        line.unitPriceCents,
        line.qty,
        line.lineTotalCents,
      );
    }

    const note =
      input.channel === 'whatsapp'
        ? 'Order sent via WhatsApp'
        : status === 'awaiting_payment'
          ? 'Waiting for Yoco payment'
          : 'Order placed on the website';
    run(db, 'INSERT INTO order_events (order_id, status, note, at) VALUES (?, ?, ?, ?)', id, status, note, nowIso);
    if (paymentStatus === 'paid') {
      run(db, 'INSERT INTO order_events (order_id, status, note, at) VALUES (?, ?, ?, ?)', id, status, 'Card payment approved (demo)', nowIso);
    }

    let redirectUrl = `/order/${token}`;
    if (paymentMethod === 'yoco') {
      const checkoutId = insertYocoCheckout(db, id, total, nowIso);
      redirectUrl = `/pay/yoco/${checkoutId}`;
    }

    let whatsappUrl: string | null = null;
    if (input.channel === 'whatsapp') {
      whatsappUrl = whatsappLink(
        buildWhatsAppMessage(number, token, lines, total, input.pickup === 'asap' ? null : pickupAt, input.customer.name, input.notes),
      );
    }

    return {
      id,
      token,
      number,
      displayNumber: `HB-${number}`,
      status,
      totalCents: total,
      redirectUrl,
      whatsappUrl,
    };
  });
}

/** Staff-entered orders: walk-ins, phone orders and logged Uber Eats / Mr D orders. */
export type StaffOrderInput = {
  channel: 'walk_in' | 'phone' | 'uber_eats' | 'mr_d';
  customerName: string;
  customerPhone: string;
  externalRef: string;
  lines: RequestedLine[];
  notes: string;
};

export function createStaffOrder(input: StaffOrderInput): CreatedOrder {
  const db = getDb();
  const now = new Date();
  const nowIso = now.toISOString();
  return tx(db, () => {
    const lines = resolveLines(mergeLines(input.lines), now);
    const total = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
    const readyAt = new Date(now.getTime() + estimateReadyMinutes(db, lines) * 60000);
    const external = input.channel === 'uber_eats' || input.channel === 'mr_d';
    const paymentMethod: PaymentMethod = external ? 'external' : 'counter';
    const paymentStatus: PaymentStatus = external ? 'external' : 'pay_on_collection';
    const number = get<{ n: number }>(db, 'SELECT COALESCE(MAX(number), 1000) + 1 AS n FROM orders')?.n ?? 1001;
    const id = newId();
    const token = newToken();
    const vat = vatInclusive(total);
    run(
      db,
      `INSERT INTO orders (id, number, token, channel, status, payment_method, payment_status, fulfilment,
        customer_name, customer_phone, customer_email, pickup_at, eta_at, notes, subtotal_cents, vat_cents,
        total_cents, card_brand, card_last4, payment_ref, external_ref, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'new', ?, ?, 'collection', ?, ?, '', ?, ?, ?, ?, ?, ?, '', '', '', ?, ?, ?)`,
      id,
      number,
      token,
      input.channel,
      paymentMethod,
      paymentStatus,
      input.customerName,
      input.customerPhone,
      readyAt.toISOString(),
      readyAt.toISOString(),
      input.notes,
      total - vat,
      vat,
      total,
      input.externalRef,
      nowIso,
      nowIso,
    );
    for (const line of lines) {
      run(
        db,
        'INSERT INTO order_items (order_id, line_key, name, unit_price_cents, qty, line_total_cents) VALUES (?, ?, ?, ?, ?, ?)',
        id,
        line.key,
        line.name,
        line.unitPriceCents,
        line.qty,
        line.lineTotalCents,
      );
    }
    run(db, 'INSERT INTO order_events (order_id, status, note, at) VALUES (?, ?, ?, ?)', id, 'new', `Entered by staff (${input.channel})`, nowIso);
    return {
      id,
      token,
      number,
      displayNumber: `HB-${number}`,
      status: 'new' as OrderStatus,
      totalCents: total,
      redirectUrl: `/order/${token}`,
      whatsappUrl: null,
    };
  });
}

const DEFAULT_NOTES: Record<OrderStatus, string> = {
  awaiting_payment: 'Waiting for payment',
  new: 'Order received',
  preparing: 'Kitchen started preparing',
  ready: 'Ready for collection',
  collected: 'Collected by customer',
  cancelled: 'Order cancelled',
};

export function setOrderStatus(orderId: string, next: OrderStatus, note = ''): OrderView {
  const db = getDb();
  return tx(db, () => {
    const row = get<OrderRow>(db, 'SELECT * FROM orders WHERE id = ?', orderId);
    if (!row) throw new OrderError('That order could not be found.', 404);
    const current = row.status as OrderStatus;
    if (!NEXT_STATUSES[current].includes(next)) {
      throw new OrderError(
        `An order that is ${STATUS_LABEL[current].toLowerCase()} cannot be moved to ${STATUS_LABEL[next].toLowerCase()}.`,
        409,
      );
    }
    const nowIso = new Date().toISOString();
    let paymentStatus = row.payment_status as PaymentStatus;
    if (next === 'cancelled') {
      paymentStatus = paymentStatus === 'paid' ? 'refund_due' : 'cancelled';
    }
    run(db, 'UPDATE orders SET status = ?, payment_status = ?, updated_at = ? WHERE id = ?', next, paymentStatus, nowIso, orderId);
    run(db, 'INSERT INTO order_events (order_id, status, note, at) VALUES (?, ?, ?, ?)', orderId, next, note || DEFAULT_NOTES[next], nowIso);
    const updated = get<OrderRow>(db, 'SELECT * FROM orders WHERE id = ?', orderId);
    return loadOrder(db, updated as OrderRow, true);
  });
}

export function completeYocoCheckout(checkoutId: string, action: 'approve' | 'cancel'): { orderToken: string; state: string } {
  const db = getDb();
  return tx(db, () => {
    const checkout = get<{ id: string; order_id: string; status: string }>(
      db,
      'SELECT id, order_id, status FROM yoco_checkouts WHERE id = ?',
      checkoutId,
    );
    if (!checkout) throw new OrderError('This checkout session has expired.', 404);
    const order = get<{ token: string; status: string; payment_status: string }>(
      db,
      'SELECT token, status, payment_status FROM orders WHERE id = ?',
      checkout.order_id,
    );
    if (!order) throw new OrderError('Order not found.', 404);
    if (checkout.status !== 'pending') {
      return { orderToken: order.token, state: checkout.status };
    }
    const nowIso = new Date().toISOString();
    if (action === 'approve') {
      run(db, "UPDATE yoco_checkouts SET status = 'succeeded', completed_at = ? WHERE id = ?", nowIso, checkoutId);
      run(
        db,
        "UPDATE orders SET status = 'new', payment_status = 'paid', payment_ref = ?, updated_at = ? WHERE id = ?",
        `YOCO-DEMO-${checkoutId.slice(4, 12).toUpperCase()}`,
        nowIso,
        checkout.order_id,
      );
      run(db, "INSERT INTO order_events (order_id, status, note, at) VALUES (?, 'new', 'Yoco payment approved (demo)', ?)", checkout.order_id, nowIso);
      return { orderToken: order.token, state: 'succeeded' };
    }
    run(db, "UPDATE yoco_checkouts SET status = 'cancelled', completed_at = ? WHERE id = ?", nowIso, checkoutId);
    run(
      db,
      "UPDATE orders SET status = 'cancelled', payment_status = 'cancelled', updated_at = ? WHERE id = ?",
      nowIso,
      checkout.order_id,
    );
    run(db, "INSERT INTO order_events (order_id, status, note, at) VALUES (?, 'cancelled', 'Yoco checkout cancelled', ?)", checkout.order_id, nowIso);
    return { orderToken: order.token, state: 'cancelled' };
  });
}

export function paymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABEL[status];
}
