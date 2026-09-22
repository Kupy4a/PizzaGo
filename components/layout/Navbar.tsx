'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pizza, ShoppingBag } from 'lucide-react';
import { useCartStore, selectItemCount } from '@/lib/cart-store';
import { useHydrated } from '@/lib/use-hydrated';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { t, menu } = useI18n();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCount = useCartStore(selectItemCount);
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const count = hydrated ? itemCount : 0;

  return (
    <nav
      className={`sticky top-0 z-40 transition-shadow duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Pizza className="w-8 h-8 text-primary" aria-hidden />
            <span className="text-xl font-bold text-secondary">PizzaGo</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {menu.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/#category-${cat.slug}`}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-full hover:bg-orange-50 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggleCart}
              aria-label={count > 0 ? t.nav.cartCount(count) : t.nav.cart}
              className="relative p-2 rounded-full hover:bg-orange-50 transition-colors"
            >
              <ShoppingBag className="w-6 h-6 text-secondary" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
