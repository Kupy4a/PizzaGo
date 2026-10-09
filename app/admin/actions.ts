'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ORDER_STATUSES } from '@/lib/orders';
import type { OrderStatus } from '@/lib/i18n/dictionaries';

const UUID = /^[0-9a-f-]{36}$/i;

// Row-level security only lets admins update or delete orders, so a non-admin
// call changes nothing even if someone posts to these actions directly.
export async function updateOrderStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as OrderStatus;
  if (!UUID.test(id) || !ORDER_STATUSES.includes(status)) return;

  const supabase = await createClient();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) console.error('Status update failed:', error);

  revalidatePath('/admin');
}

export async function deleteOrder(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!UUID.test(id)) return;

  // order_items rows are removed by the cascade on their foreign key.
  const supabase = await createClient();
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) console.error('Order delete failed:', error);

  revalidatePath('/admin');
}
