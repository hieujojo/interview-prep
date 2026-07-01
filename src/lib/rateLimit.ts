// src/lib/rateLimit.ts
// Rate limiter don gian theo userId, luu trong memory.
// Luu y: chi hoat dong dung tren 1 instance server (dev, hoac VPS/self-host).
// Neu deploy serverless nhieu instance (Vercel traffic cao), can doi sang Upstash Redis.

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateMap = new Map<string, RateEntry>();

const DEFAULT_WINDOW_MS = 60_000; // 1 phut
const DEFAULT_MAX_REQUESTS = 3;   // toi da 3 request / 1 phut / user

export function checkRateLimit(
  key: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}