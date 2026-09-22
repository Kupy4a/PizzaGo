import { findProduct } from '@/lib/menu';

export const PAYMENT_METHODS = {
  card: 'Банковская карта онлайн',
  card_on_delivery: 'Картой при получении',
  cash: 'Наличными курьеру',
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

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

type Result = { ok: true; order: ValidatedOrder } | { ok: false; error: string };

// Validates an untrusted order payload. Prices come from the catalog,
// never from the client.
export function validateOrder(body: unknown): Result {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'Некорректный запрос' };
  const data = body as Record<string, unknown>;
  const customer = (data.customer ?? {}) as Record<string, unknown>;
  const address = (data.address ?? {}) as Record<string, unknown>;

  const name = str(customer.name, 100);
  const phone = str(customer.phone, 30);
  const email = str(customer.email, 100);
  if (!name) return { ok: false, error: 'Укажите имя' };
  if (!PHONE_RE.test(phone)) return { ok: false, error: 'Некорректный телефон' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Некорректный email' };

  const city = str(address.city);
  const street = str(address.street);
  const house = str(address.house, 20);
  if (!city || !street || !house) return { ok: false, error: 'Заполните адрес доставки' };

  const payment = data.payment;
  if (typeof payment !== 'string' || !(payment in PAYMENT_METHODS)) {
    return { ok: false, error: 'Выберите способ оплаты' };
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    return { ok: false, error: 'Корзина пуста' };
  }

  const lines: ValidatedOrder['lines'] = [];
  for (const raw of data.items as Record<string, unknown>[]) {
    const product = findProduct(str(raw?.productId, 50));
    const quantity = Number(raw?.quantity);
    if (!product || !product.is_available) return { ok: false, error: 'Товар недоступен' };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { ok: false, error: 'Некорректное количество' };
    }
    lines.push({ productId: product.id, name: product.name, quantity, price: product.price });
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
