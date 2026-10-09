import { randomBytes, randomUUID } from 'node:crypto';

export const newId = (): string => randomUUID();

/** Unguessable public token used in order-tracking links. */
export const newToken = (): string => randomBytes(18).toString('base64url');

export const newCheckoutId = (): string => `yco_${randomBytes(12).toString('hex')}`;

export const newRef = (prefix: string): string => `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}`;
