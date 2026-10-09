import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { OrderCard } from '@/components/orders/OrderCard';
import { Button } from '@/components/ui/Button';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/server';
import { ORDER_COLUMNS, ORDER_STATUSES, type OrderRow } from '@/lib/orders';
import { DeleteOrderButton } from '@/components/orders/DeleteOrderButton';
import { updateOrderStatus } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${getDictionary(await getLocale()).admin.title} — PizzaGo` };
}

export default async function AdminPage() {
  if (!isSupabaseConfigured) notFound();

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect('/login');

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) notFound();

  const locale = await getLocale();
  const t = getDictionary(locale);
  const { data: orders } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<OrderRow[]>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary mb-8">{t.admin.title}</h1>

      {!orders?.length ? (
        <p className="text-gray-500">{t.admin.empty}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} locale={locale} showCustomer>
              <div className="flex flex-wrap items-center gap-2">
              <form action={updateOrderStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={order.id} />
                <label htmlFor={`status-${order.id}`} className="sr-only">
                  {t.admin.status}
                </label>
                <select
                  id={`status-${order.id}`}
                  name="status"
                  defaultValue={order.status}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-sm bg-white"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t.status[s]}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="outline">
                  {t.admin.save}
                </Button>
              </form>
              <DeleteOrderButton orderId={order.id} />
              </div>
            </OrderCard>
          ))}
        </div>
      )}
    </div>
  );
}
