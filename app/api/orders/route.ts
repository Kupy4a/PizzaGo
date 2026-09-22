import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/server';
import { validateOrder, type ValidatedOrder } from '@/lib/order';

// Vercel's filesystem is read-only except for the temp dir; orders stored
// there are lost on redeploy, which is fine for a demo without Supabase.
const ORDERS_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'pizzago')
  : path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(ORDERS_DIR, 'orders.json');

async function saveToFile(order: ValidatedOrder) {
  let orders: unknown[] = [];
  try {
    orders = JSON.parse(await fs.readFile(ORDERS_FILE, 'utf-8'));
  } catch {
    await fs.mkdir(ORDERS_DIR, { recursive: true });
  }

  const id = randomUUID();
  orders.push({ id, status: 'pending', created_at: new Date().toISOString(), ...order });
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return id;
}

async function saveToSupabase(order: ValidatedOrder) {
  const { supabase, user } = await getCurrentUser();
  // The id is generated here: guests may insert orders but not read them
  // back, so `insert().select()` would be rejected by row-level security.
  const id = randomUUID();

  const { error } = await supabase.from('orders').insert({
    id,
    user_id: user?.id ?? null,
    total_price: order.total,
    status: 'pending',
    customer: order.customer,
    address: order.address,
    payment_method: order.payment,
  });
  if (error) throw error;

  const { error: itemsError } = await supabase.from('order_items').insert(
    order.lines.map((l) => ({
      order_id: id,
      product_id: l.productId,
      quantity: l.quantity,
      price_at_purchase: l.price,
    }))
  );
  if (itemsError) throw itemsError;

  return id;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const result = validateOrder(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const id = isSupabaseConfigured
      ? await saveToSupabase(result.order)
      : await saveToFile(result.order);
    return NextResponse.json({ id, total: result.order.total }, { status: 201 });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
