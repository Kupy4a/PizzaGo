import { createHash } from 'crypto';

export const MAX_ORDERS_PER_HOUR = 10;
const HOUR = 60 * 60 * 1000;

// Visitors are identified by a hash, so no IP address is stored anywhere.
export function clientHash(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  return createHash('sha256')
    .update(`${ip}:${process.env.RATE_LIMIT_SALT ?? 'pizzago'}`)
    .digest('hex')
    .slice(0, 32);
}

// Fallback limiter for the file-based mode. Serverless instances don't share
// this map, so with Supabase the database does the counting instead.
const hits = new Map<string, number[]>();

export function tooManyRequests(hash: string) {
  const now = Date.now();
  const recent = (hits.get(hash) ?? []).filter((t) => now - t < HOUR);
  if (recent.length >= MAX_ORDERS_PER_HOUR) {
    hits.set(hash, recent);
    return true;
  }
  recent.push(now);
  hits.set(hash, recent);
  if (hits.size > 10_000) hits.clear();
  return false;
}
