'use client';

import { useState } from 'react';
import { HeroSlider } from '@/components/hero/HeroSlider';
import { CategorySection } from '@/components/products/CategorySection';
import { ProductModal } from '@/components/products/ProductModal';
import { useI18n } from '@/lib/i18n/context';

export default function Home() {
  const { t, menu } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedProduct = selectedId ? (menu.productById.get(selectedId) ?? null) : null;

  return (
    <div>
      <HeroSlider />

      <div id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-16">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-secondary mb-4">{t.menu.title}</h1>
          <div className="h-1 w-20 bg-primary rounded-full mx-auto" />
        </div>

        {menu.categories.map((category) => (
          <CategorySection
            key={category.slug}
            category={category}
            products={menu.products.filter((p) => p.category_id === category.id)}
            onOpenModal={(product) => setSelectedId(product.id)}
          />
        ))}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
