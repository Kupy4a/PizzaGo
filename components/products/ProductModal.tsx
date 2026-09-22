'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import type { Product } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import { useI18n } from '@/lib/i18n/context';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { t, locale } = useI18n();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Modal isOpen={isOpen && product !== null} onClose={onClose} label={product?.name ?? ''}>
      {product && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative h-64 bg-gray-100">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="512px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label={t.product.close}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-secondary mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
            <p className="text-3xl font-bold text-primary mb-6">{formatPrice(product.price, locale)}</p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                addItem(product.id);
                onClose();
              }}
            >
              {t.product.addToCart}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
