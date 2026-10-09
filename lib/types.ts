// Shared, client-safe types.

export type OrderStatus = 'awaiting_payment' | 'new' | 'preparing' | 'ready' | 'collected' | 'cancelled';
export type OrderChannel = 'website' | 'whatsapp' | 'walk_in' | 'phone' | 'uber_eats' | 'mr_d';
export type PaymentMethod = 'card' | 'yoco' | 'counter' | 'whatsapp' | 'external';
export type PaymentStatus = 'paid' | 'awaiting_payment' | 'pay_on_collection' | 'external' | 'cancelled' | 'refund_due';
export type Fulfilment = 'collection' | 'dine_in';
export type MessageType = 'contact' | 'catering' | 'table' | 'lunch' | 'subscribe';

export type DayHours = { open: string; close: string } | null;
/** Index 0 = Sunday ... 6 = Saturday. */
export type Hours = DayHours[];
export type StoreLinks = { ubereats: string; mrd: string };

/** Full https:// page links. A blank link hides its icon on the website. */
export type SocialLinks = { facebook: string; instagram: string; tiktok: string };
export type PrepSettings = { baseMinutes: number; perOpenOrderMinutes: number; maxMinutes: number };
export type ContactSettings = { phone: string; whatsapp: string; email: string };
export type ChecklistKey =
  | 'prices_confirmed'
  | 'hours_confirmed'
  | 'store_links_set'
  | 'photos_replaced'
  | 'vision_mission_confirmed'
  | 'contact_confirmed';
export type Checklist = Record<ChecklistKey, boolean>;

export type SiteSettings = {
  hours: Hours;
  storeLinks: StoreLinks;
  social: SocialLinks;
  prep: PrepSettings;
  contact: ContactSettings;
  checklist: Checklist;
};

export type MenuItem = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  story: string;
  categoryId: string;
  categoryName: string;
  priceCents: number;
  images: string[];
  tags: string[];
  spice: number;
  vegetarian: boolean;
  prepMinutes: number;
  available: boolean;
  featured: boolean;
  sort: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  sort: number;
  items: MenuItem[];
};

export type SpecialView = {
  id: string;
  title: string;
  description: string;
  itemId: string | null;
  itemName: string;
  itemImage: string;
  priceCents: number;
  regularPriceCents: number;
  weekday: number | null;
  windowStart: string | null;
  windowEnd: string | null;
  active: boolean;
  sort: number;
  available: boolean;
};

/** A line in the browser basket. key = "item:<id>" or "special:<id>". */
export type CartLine = {
  key: string;
  name: string;
  priceCents: number;
  image: string;
  qty: number;
};

export type OrderLineView = {
  key: string;
  name: string;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type OrderEventView = { status: OrderStatus; note: string; at: string };

export type OrderView = {
  id: string;
  number: number;
  displayNumber: string;
  token: string;
  channel: OrderChannel;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfilment: Fulfilment;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAt: string | null;
  etaAt: string | null;
  notes: string;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  cardBrand: string;
  cardLast4: string;
  paymentRef: string;
  createdAt: string;
  updatedAt: string;
  lines: OrderLineView[];
  events: OrderEventView[];
};

export type MessageView = {
  id: string;
  type: MessageType;
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  details: Record<string, string>;
  status: 'new' | 'handled';
  createdAt: string;
};
