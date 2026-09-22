import type { OrderStatus } from '@/lib/i18n/dictionaries';

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'delivered', 'cancelled'];

// Columns loaded for the account and admin pages.
export const ORDER_COLUMNS =
  'id, status, total_price, created_at, customer, address, order_items (product_id, quantity, price_at_purchase)';

export interface OrderRow {
  id: string;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  customer: { name: string; phone: string; email: string };
  address: { city: string; street: string; house: string; apartment?: string; comment?: string };
  order_items: { product_id: string; quantity: number; price_at_purchase: number }[];
}

export const shortOrderId = (id: string) => id.slice(0, 8).toUpperCase();
