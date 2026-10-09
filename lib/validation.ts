import { z } from 'zod';

export const nameSchema = z.string().trim().min(2, 'Please enter your name').max(80, 'Name is too long');

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ''))
  .refine((value) => /^\+?\d{9,15}$/.test(value), 'Enter a valid mobile number, for example 082 123 4567');

export const emailSchema = z
  .string()
  .trim()
  .max(120, 'Email is too long')
  .refine((value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), 'Enter a valid email address');

export const orderLineSchema = z.object({
  key: z.string().min(3).max(80),
  qty: z.number().int().min(1).max(20),
});

export const orderSchema = z.object({
  channel: z.enum(['website', 'whatsapp']).default('website'),
  fulfilment: z.enum(['collection', 'dine_in']).default('collection'),
  pickup: z.string().min(1).max(40),
  customer: z.object({
    name: nameSchema,
    phone: phoneSchema,
    email: emailSchema.optional().default(''),
  }),
  notes: z.string().trim().max(300, 'Notes must be 300 characters or fewer').optional().default(''),
  lines: z.array(orderLineSchema).min(1, 'Your basket is empty').max(40),
  expectedTotalCents: z.number().int().min(0).max(10000000).optional(),
  payment: z.object({
    method: z.enum(['card', 'yoco', 'counter']),
    card: z
      .object({
        number: z.string().max(40).optional().default(''),
        name: z.string().max(80).optional().default(''),
        expiry: z.string().max(10).optional().default(''),
        cvc: z.string().max(6).optional().default(''),
      })
      .optional(),
  }),
});

export const messageSchema = z.object({
  type: z.enum(['contact', 'catering', 'table', 'lunch', 'subscribe']),
  name: z.string().trim().max(80).optional().default(''),
  email: emailSchema.optional().default(''),
  phone: z.string().trim().max(20).optional().default(''),
  subject: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().max(2000).optional().default(''),
  details: z.record(z.string(), z.string().trim().max(400)).optional().default({}),
  consent: z.boolean().optional().default(false),
});

export const staffLoginSchema = z.object({
  pin: z.string().trim().min(4).max(12),
});

export const orderStatusSchema = z.object({
  status: z.enum(['preparing', 'ready', 'collected', 'cancelled']),
  note: z.string().trim().max(200).optional().default(''),
});

export const staffOrderSchema = z.object({
  channel: z.enum(['walk_in', 'phone', 'uber_eats', 'mr_d']),
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z.string().trim().max(20).optional().default(''),
  externalRef: z.string().trim().max(60).optional().default(''),
  lines: z.array(z.object({ key: z.string().min(3).max(80), qty: z.number().int().min(1).max(40) })).min(1).max(60),
  notes: z.string().trim().max(300).optional().default(''),
});

export const itemPatchSchema = z.object({
  available: z.boolean().optional(),
  priceCents: z.number().int().min(100).max(200000).optional(),
  description: z.string().trim().max(400).optional(),
});

const hhmm = z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM');

export const specialSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional().default(''),
  itemId: z.string().min(1).nullable().optional(),
  priceCents: z.number().int().min(100).max(200000).nullable().optional(),
  weekday: z.number().int().min(0).max(6).nullable().optional(),
  windowStart: hhmm.nullable().optional(),
  windowEnd: hhmm.nullable().optional(),
  active: z.boolean().optional().default(true),
  sort: z.number().int().min(0).max(999).optional().default(0),
});

export const specialPatchSchema = specialSchema.partial();

const dayHours = z
  .object({ open: hhmm, close: hhmm })
  .nullable();

export const settingsSchema = z.object({
  hours: z.array(dayHours).length(7).optional(),
  storeLinks: z
    .object({
      ubereats: z.string().trim().max(300),
      mrd: z.string().trim().max(300),
    })
    .optional(),
  prep: z
    .object({
      baseMinutes: z.number().int().min(0).max(120),
      perOpenOrderMinutes: z.number().int().min(0).max(30),
      maxMinutes: z.number().int().min(10).max(240),
    })
    .optional(),
  contact: z
    .object({
      phone: z.string().trim().max(30),
      whatsapp: z.string().trim().max(20),
      email: z.string().trim().max(120),
    })
    .optional(),
  checklist: z
    .object({
      prices_confirmed: z.boolean(),
      hours_confirmed: z.boolean(),
      store_links_set: z.boolean(),
      photos_replaced: z.boolean(),
      vision_mission_confirmed: z.boolean(),
      contact_confirmed: z.boolean(),
    })
    .optional(),
});
