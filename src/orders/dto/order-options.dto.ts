export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CUTTING',
  'SEWING',
  'READY',
  'DELIVERED',
  'CANCELLED',
] as const;

export const ORDER_SOURCES = [
  'DREZAURA',
  'PHYSICAL_SHOP',
  'PHONE_CALL',
  'WHATSAPP',
  'ONLINE',
] as const;

export const PAYMENT_STATUSES = [
  'UNPAID',
  'ADVANCE_PAID',
  'PARTIALLY_PAID',
  'PAID',
  'REFUNDED',
] as const;

export const ORDER_PAYMENT_MODES = [
  'CASH',
  'ONLINE_TRANSFER',
  'BANK_DEPOSIT',
  'CARD',
  'MIXED',
] as const;

export const ORDER_ITEM_STATUSES = [
  'PENDING',
  'CUTTING',
  'SEWING',
  'READY',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
export type OrderSourceValue = (typeof ORDER_SOURCES)[number];
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];
export type OrderPaymentModeValue = (typeof ORDER_PAYMENT_MODES)[number];
export type OrderItemStatusValue = (typeof ORDER_ITEM_STATUSES)[number];