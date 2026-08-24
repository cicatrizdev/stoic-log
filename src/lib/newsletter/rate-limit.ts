/**
 * Best-effort, per-instance rate limiter. On Vercel a warm function instance
 * lives for minutes to hours and is shared across requests, so this catches
 * the common abuse case with zero infrastructure. Cold starts reset it —
 * acceptable: the honeypot and Resend's own quota bound the damage.
 */
type Bucket = { count: number; resetAt: number }

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

const buckets = new Map<string, Bucket>()

function sweep(now: number) {
  if (buckets.size < 500) return
  for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key)
}

export function checkRateLimit(key: string, now = Date.now()) {
  sweep(now)
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true as const }
  }
  if (bucket.count >= MAX_PER_WINDOW) {
    return {
      ok: false as const,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }
  bucket.count += 1
  return { ok: true as const }
}

export function clientKey(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
