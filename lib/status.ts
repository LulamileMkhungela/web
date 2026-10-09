import type { OrderChannel, OrderStatus, PaymentMethod, PaymentStatus } from './types';

/** Customer-facing progress steps shown on the order tracker. */
export const TRACK_STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: 'new', label: 'Received', hint: 'We have your order' },
  { status: 'preparing', label: 'Cooking', hint: 'Our kitchen is preparing it' },
  { status: 'ready', label: 'Ready', hint: 'Ready for collection at the counter' },
  { status: 'collected', label: 'Collected', hint: 'Enjoy your meal' },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: 'Awaiting payment',
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready for collection',
  collected: 'Collected',
  cancelled: 'Cancelled',
};

/** Allowed staff transitions. Cancelling is possible until collection. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  awaiting_payment: ['new', 'cancelled'],
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['collected', 'cancelled'],
  collected: [],
  cancelled: [],
};

export const ACTIVE_STATUSES: OrderStatus[] = ['new', 'preparing', 'ready'];

export const CHANNEL_LABEL: Record<OrderChannel, string> = {
  website: 'Website',
  whatsapp: 'WhatsApp',
  walk_in: 'Walk-in',
  phone: 'Phone',
  uber_eats: 'Uber Eats',
  mr_d: 'Mr D',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: 'Debit card (demo)',
  yoco: 'Yoco (demo checkout)',
  counter: 'Pay at counter',
  whatsapp: 'Agree payment on WhatsApp',
  external: 'Paid through delivery app',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  awaiting_payment: 'Awaiting payment',
  pay_on_collection: 'Pay on collection',
  external: 'Paid through app',
  cancelled: 'Cancelled',
  refund_due: 'Refund due',
};
