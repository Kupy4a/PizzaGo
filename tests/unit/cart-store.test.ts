import { beforeEach, describe, expect, it } from 'vitest';
import { selectItemCount, selectTotalPrice, useCartStore, withProducts } from '@/lib/cart-store';
import { getMenu } from '@/lib/menu';

const cart = () => useCartStore.getState();

describe('cart store', () => {
  beforeEach(() => cart().clearCart());

  it('adds items and increments quantity for repeats', () => {
    cart().addItem('p1');
    cart().addItem('p1');
    cart().addItem('dr1');
    expect(cart().items).toEqual([
      { productId: 'p1', quantity: 2 },
      { productId: 'dr1', quantity: 1 },
    ]);
    expect(selectItemCount(cart())).toBe(3);
    expect(selectTotalPrice(cart())).toBe(499 * 2 + 149);
  });

  it('removes an item when its quantity drops to zero', () => {
    cart().addItem('p1');
    cart().updateQuantity('p1', 0);
    expect(cart().items).toEqual([]);
  });

  it('removes items explicitly', () => {
    cart().addItem('p1');
    cart().addItem('p2');
    cart().removeItem('p1');
    expect(cart().items.map((i) => i.productId)).toEqual(['p2']);
  });

  it('joins items with localized products and skips unknown ids', () => {
    const lines = withProducts(
      [
        { productId: 'p2', quantity: 1 },
        { productId: 'ghost', quantity: 3 },
      ],
      getMenu('ru').productById
    );
    expect(lines).toHaveLength(1);
    expect(lines[0].product.name).toBe('Пепперони');
  });
});
