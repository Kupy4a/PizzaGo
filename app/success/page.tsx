import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Pizza } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  return { title: getDictionary(await getLocale()).meta.successTitle };
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const t = getDictionary(await getLocale()).success;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" aria-hidden />
        </div>
        <h1 className="text-3xl font-bold text-secondary mb-4">{t.title}</h1>
        {id && (
          <p className="text-sm text-gray-500 mb-2">
            {t.number} <span className="font-mono">{id.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
        <p className="text-gray-600 mb-8">{t.text}</p>
        <Link href="/" className={buttonVariants({ size: 'lg' })}>
          <Pizza className="w-5 h-5 mr-2" aria-hidden />
          {t.back}
        </Link>
      </div>
    </div>
  );
}
