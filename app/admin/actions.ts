'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ORDER_STATUSES } from '@/lib/orders';
import type { OrderStatus } from '@/lib/i18n/dictionaries';

// Row-level security only lets admins update orders, so a non-admin call
// changes nothing even if someone posts to this action directly.
export async function updateOrderStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as OrderStatus;
  if (!id || !ORDER_STATUSES.includes(status)) return;

  const supabase = await createClient();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) console.error('Status update failed:', error);

  revalidatePath('/admin');
}
