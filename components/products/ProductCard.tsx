import Image from 'next/image';
import { Plus } from 'lucide-react';
import type { Product } from '@/types';
import { Card } from '@/components/ui/Card';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenModal }) => {
  const unavailable = !product.is_available;

  return (
    <Card className="group bg-white transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <button
        type="button"
        disabled={unavailable}
        onClick={() => onOpenModal(product)}
        className="block w-full text-left disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        aria-label={`${product.name}, ${formatPrice(product.price)}`}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {unavailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Нет в наличии</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-secondary mb-1 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 min-h-10 mb-3">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
            <span className="p-2 rounded-full bg-primary text-white group-hover:bg-primary-dark transition-colors">
              <Plus className="w-5 h-5" aria-hidden />
            </span>
          </div>
        </div>
      </button>
    </Card>
  );
};
