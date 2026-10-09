import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/server';
import { createAdminClient, hasServiceRole } from '@/lib/supabase/admin';
import { clientHash, tooManyRequests } from '@/lib/rate-limit';
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

// One database function builds the order: it prices the items from the
// catalog and enforces the hourly limit per visitor. Only the service role
// may call it, so nobody can place orders around this endpoint.
async function saveToSupabase(order: ValidatedOrder, hash: string, userId: string | null) {
  const { data, error } = await createAdminClient().rpc('create_order', {
    p_customer: order.customer,
    p_address: order.address,
    p_payment: order.payment,
    p_items: order.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    p_client: hash,
    p_user_id: userId,
  });

  if (error) {
    if (error.message.includes('rate_limited')) return { rateLimited: true as const };
    throw error;
  }
  return { id: data as string };
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

  const hash = clientHash(req);

  try {
    if (isSupabaseConfigured) {
      if (!hasServiceRole) {
        console.error('SUPABASE_SERVICE_ROLE_KEY is missing: orders cannot be stored.');
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
      }
      // The session is read from the cookie, so the order is linked to the
      // signed-in user without trusting anything the request body claims.
      const { user } = await getCurrentUser();
      const saved = await saveToSupabase(result.order, hash, user?.id ?? null);
      if ('rateLimited' in saved) {
        return NextResponse.json({ error: 'too_many_orders' }, { status: 429 });
      }
      return NextResponse.json({ id: saved.id, total: result.order.total }, { status: 201 });
    }

    if (tooManyRequests(hash)) {
      return NextResponse.json({ error: 'too_many_orders' }, { status: 429 });
    }
    const id = await saveToFile(result.order);
    return NextResponse.json({ id, total: result.order.total }, { status: 201 });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
