'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore, selectTotalPrice, withProducts } from '@/lib/cart-store';
import { useDismiss } from '@/lib/use-dismiss';
import { useI18n } from '@/lib/i18n/context';
import { formatPrice } from '@/lib/format';

export const CartDrawer: React.FC = () => {
  const { t, locale, menu } = useI18n();
  const { isCartOpen, closeCart, items, updateQuantity, removeItem } = useCartStore();
  const totalPrice = useCartStore(selectTotalPrice);
  const lines = withProducts(items, menu.productById);
  useDismiss(isCartOpen, closeCart);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/50"
          />

          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t.cart.title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-secondary">{t.cart.title}</h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label={t.cart.close}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingBag className="w-12 h-12 mb-4" aria-hidden />
                  <p className="text-lg mb-2">{t.cart.empty}</p>
                  <p className="text-sm">{t.cart.emptyHint}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {lines.map(({ product, quantity }) => (
                    <li key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-secondary truncate">{product.name}</p>
                        <p className="text-primary font-semibold">
                          {formatPrice(product.price * quantity, locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label={t.cart.decrease(product.name)}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-secondary">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label={t.cart.increase(product.name)}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          aria-label={t.cart.remove(product.name)}
                          className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-secondary">{t.cart.total}</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(totalPrice, locale)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full text-center py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors shadow-lg"
                >
                  {t.cart.checkout}
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
