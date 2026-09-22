import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Notice } from '@/components/ui/Notice';
import { OrderCard } from '@/components/orders/OrderCard';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/server';
import { ORDER_COLUMNS, type OrderRow } from '@/lib/orders';

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${getDictionary(await getLocale()).account.title} — PizzaGo` };
}

export default async function AccountPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  if (!isSupabaseConfigured) return <Notice>{t.auth.notConfigured}</Notice>;

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect('/login');

  const [{ data: orders }, { data: isAdmin }] = await Promise.all([
    supabase
      .from('orders')
      .select(ORDER_COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<OrderRow[]>(),
    supabase.rpc('is_admin'),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">{t.account.title}</h1>
          <p className="text-sm text-gray-500">
            {t.account.signedInAs} {user.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full text-primary hover:bg-orange-50"
            >
              <ShieldCheck className="w-4 h-4 mr-2" aria-hidden />
              {t.account.admin}
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      {!orders?.length ? (
        <p className="text-gray-500">{t.account.empty}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
