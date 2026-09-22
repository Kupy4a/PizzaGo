'use client';

import { Clock, Phone, Pizza } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-secondary text-gray-300 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-6 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-white">
          <Pizza className="w-6 h-6 text-primary" aria-hidden />
          <span className="text-lg font-bold">PizzaGo</span>
        </div>
        <p className="flex items-center gap-2">
          <Clock className="w-4 h-4" aria-hidden />
          {t.footer.hours}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="w-4 h-4" aria-hidden />
          +7 (800) 000-00-00
        </p>
      </div>
    </footer>
  );
};
