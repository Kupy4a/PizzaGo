import { findProduct } from '@/lib/menu';
import type { ErrorCode } from '@/lib/i18n/dictionaries';

export const PAYMENT_METHODS = ['card', 'card_on_delivery', 'cash'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface OrderRequest {
  items: { productId: string; quantity: number }[];
  customer: { name: string; phone: string; email: string };
  address: {
    city: string;
    street: string;
    house: string;
    apartment: string;
    comment: string;
  };
  payment: PaymentMethod;
}

export interface ValidatedOrder {
  customer: OrderRequest['customer'];
  address: OrderRequest['address'];
  payment: PaymentMethod;
  lines: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
}

const MAX_QUANTITY = 50;
const PHONE_RE = /^\+?[\d\s()-]{10,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

type Result = { ok: true; order: ValidatedOrder } | { ok: false; error: ErrorCode };

// Validates an untrusted order payload. Prices come from the catalog,
// never from the client. Errors are codes; the UI translates them.
export function validateOrder(body: unknown): Result {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'bad_request' };
  const data = body as Record<string, unknown>;
  const customer = (data.customer ?? {}) as Record<string, unknown>;
  const address = (data.address ?? {}) as Record<string, unknown>;

  const name = str(customer.name, 100);
  const phone = str(customer.phone, 30);
  const email = str(customer.email, 100);
  if (!name) return { ok: false, error: 'name_required' };
  if (!PHONE_RE.test(phone)) return { ok: false, error: 'invalid_phone' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'invalid_email' };

  const city = str(address.city);
  const street = str(address.street);
  const house = str(address.house, 20);
  if (!city || !street || !house) return { ok: false, error: 'address_required' };

  const payment = data.payment;
  if (!PAYMENT_METHODS.includes(payment as PaymentMethod)) {
    return { ok: false, error: 'payment_required' };
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    return { ok: false, error: 'cart_empty' };
  }

  const lines: ValidatedOrder['lines'] = [];
  for (const raw of data.items as Record<string, unknown>[]) {
    const product = findProduct(str(raw?.productId, 50));
    const quantity = Number(raw?.quantity);
    if (!product || !product.is_available) return { ok: false, error: 'product_unavailable' };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { ok: false, error: 'invalid_quantity' };
    }
    lines.push({ productId: product.id, name: product.name.en, quantity, price: product.price });
  }

  return {
    ok: true,
    order: {
      customer: { name, phone, email },
      address: {
        city,
        street,
        house,
        apartment: str(address.apartment, 20),
        comment: str(address.comment, 500),
      },
      payment: payment as PaymentMethod,
      lines,
      total: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    },
  };
}
