import { createHmac, timingSafeEqual } from 'node:crypto'
import { isLocale, type Locale } from '@/lib/i18n'

/**
 * Stateless double opt-in: the confirmation link carries an HMAC-signed
 * `{ email, locale, expiry }` token, so no database is needed. Anyone clicking
 * a valid, unexpired link proves control of the inbox that received it.
 */
const EXPIRY_MS = 24 * 60 * 60 * 1000

function secret(): string | null {
  return process.env.NEWSLETTER_TOKEN_SECRET || null
}

function sign(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('base64url')
}

export function createToken(
  email: string,
  locale: Locale,
  now = Date.now()
): string | null {
  const key = secret()
  if (!key) return null
  const payload = Buffer.from(
    JSON.stringify({ e: email, l: locale, x: now + EXPIRY_MS })
  ).toString('base64url')
  return `${payload}.${sign(payload, key)}`
}

export function verifyToken(
  token: string,
  now = Date.now()
): { email: string; locale: Locale } | null {
  const key = secret()
  if (!key) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const payload = token.slice(0, dot)
  const mac = Buffer.from(token.slice(dot + 1))
  const expected = Buffer.from(sign(payload, key))
  if (mac.length !== expected.length || !timingSafeEqual(mac, expected)) {
    return null
  }
  try {
    const data: unknown = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    )
    if (typeof data !== 'object' || data === null) return null
    const { e, l, x } = data as Record<string, unknown>
    if (typeof e !== 'string' || !isLocale(l) || typeof x !== 'number') {
      return null
    }
    if (x < now) return null
    return { email: e, locale: l }
  } catch {
    return null
  }
}
