'use client';

import type { Product, Category } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { useI18n } from '@/lib/i18n/context';

interface CategorySectionProps {
  category: Category;
  products: Product[];
  onOpenModal: (product: Product) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  products,
  onOpenModal,
}) => {
  const { t } = useI18n();

  return (
  <section id={`category-${category.slug}`} className="py-12 scroll-mt-20">
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-secondary mb-2">{category.name}</h2>
      <div className="h-1 w-20 bg-primary rounded-full" />
    </div>
    {products.length === 0 ? (
      <p className="text-center py-16 text-lg text-gray-400">
        {t.menu.empty}
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onOpenModal={onOpenModal} />
        ))}
      </div>
    )}
  </section>
  );
};
