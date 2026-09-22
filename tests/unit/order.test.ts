import { describe, expect, it } from 'vitest';
import { validateOrder } from '@/lib/order';

const validOrder = () => ({
  items: [
    { productId: 'p1', quantity: 2 },
    { productId: 'd1', quantity: 1 },
  ],
  customer: { name: '  John  ', phone: '+1 555 123 4567', email: 'john@example.com' },
  address: { city: 'New York', street: 'Broadway', house: '1', apartment: '', comment: '' },
  payment: 'card',
});

describe('validateOrder', () => {
  it('accepts a valid order and totals it from catalog prices', () => {
    const result = validateOrder(validOrder());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.total).toBe(499 * 2 + 349);
    expect(result.order.lines).toEqual([
      { productId: 'p1', name: 'Margherita', quantity: 2, price: 499 },
      { productId: 'd1', name: 'Tiramisu', quantity: 1, price: 349 },
    ]);
    expect(result.order.customer.name).toBe('John');
  });

  it('ignores prices sent by the client', () => {
    const body = validOrder() as ReturnType<typeof validOrder> & { total: number };
    body.items = [{ productId: 'p1', quantity: 1, price: 1 } as never];
    body.total = 1;
    const result = validateOrder(body);
    expect(result.ok && result.order.total).toBe(499);
  });

  it.each([
    ['not an object', null, 'bad_request'],
    ['missing name', { customer: { name: ' ' } }, 'name_required'],
    ['bad phone', { customer: { phone: '12' } }, 'invalid_phone'],
    ['bad email', { customer: { email: 'nope' } }, 'invalid_email'],
    ['missing house', { address: { house: '' } }, 'address_required'],
    ['unknown payment', { payment: 'bitcoin' }, 'payment_required'],
    ['empty cart', { items: [] }, 'cart_empty'],
    ['unknown product', { items: [{ productId: 'ghost', quantity: 1 }] }, 'product_unavailable'],
    ['zero quantity', { items: [{ productId: 'p1', quantity: 0 }] }, 'invalid_quantity'],
    ['fractional quantity', { items: [{ productId: 'p1', quantity: 1.5 }] }, 'invalid_quantity'],
    ['huge quantity', { items: [{ productId: 'p1', quantity: 51 }] }, 'invalid_quantity'],
  ])('rejects %s', (_, patch, error) => {
    let body: unknown = null;
    if (patch) {
      const base = validOrder();
      const p = patch as Record<string, unknown>;
      body = {
        ...base,
        ...p,
        customer: { ...base.customer, ...(p.customer as object) },
        address: { ...base.address, ...(p.address as object) },
      };
    }
    expect(validateOrder(body)).toEqual({ ok: false, error });
  });
});
