import { NextResponse, type NextRequest } from 'next/server'
import { site } from '@/content'
import { isLocale, defaultLocale } from '@/lib/i18n'
import { subscribeSchema, LIMITS } from '@/lib/newsletter/schema'
import { checkRateLimit, clientKey } from '@/lib/newsletter/rate-limit'
import { createToken } from '@/lib/newsletter/token'
import { sendConfirmation } from '@/lib/newsletter/resend'

/**
 * Same-origin check for browsers that send an Origin header: the origin must
 * be this very deployment (production host, preview host or localhost).
 */
function originAllowed(request: NextRequest, origin: string): boolean {
  const proto =
    request.headers.get('x-forwarded-proto') ??
    new URL(request.url).protocol.replace(':', '')
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const self = host ? `${proto}://${host}` : null
  const allowed = new Set(
    [
      site.url,
      self,
      process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
      process.env.VERCEL_BRANCH_URL &&
        `https://${process.env.VERCEL_BRANCH_URL}`,
      process.env.VERCEL_PROJECT_PRODUCTION_URL &&
        `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    ].filter((o): o is string => Boolean(o))
  )
  return allowed.has(origin)
}

type Parsed = { kind: 'json' | 'form'; data: Record<string, unknown> }

async function parseBody(request: NextRequest): Promise<Parsed | null> {
  const type = request.headers.get('content-type') ?? ''
  if (type.includes('application/json')) {
    const data = await request.json().catch(() => null)
    return data && typeof data === 'object' ? { kind: 'json', data } : null
  }
  if (
    type.includes('application/x-www-form-urlencoded') ||
    type.includes('multipart/form-data')
  ) {
    const form = await request.formData().catch(() => null)
    if (!form) return null
    const data: Record<string, unknown> = {}
    for (const [k, v] of form.entries()) if (typeof v === 'string') data[k] = v
    return { kind: 'form', data }
  }
  return null
}

function json(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit
) {
  return NextResponse.json(body, { status, headers })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && !originAllowed(request, origin)) {
    return json({ ok: false, error: 'forbidden' }, 403)
  }

  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > LIMITS.maxBodyBytes) {
    return json({ ok: false, error: 'too_large' }, 413)
  }

  const parsed = await parseBody(request)
  if (!parsed) return json({ ok: false, error: 'invalid' }, 400)
  const { kind, data } = parsed
  const locale = isLocale(data.locale) ? data.locale : defaultLocale
  const sentUrl = new URL(`/${locale}/newsletter/sent`, request.url)

  // Honeypot + fill-time check: pretend success, do nothing.
  const website = typeof data.website === 'string' ? data.website.trim() : ''
  const startedAt = Number(data.startedAt)
  const tooFast =
    Number.isFinite(startedAt) &&
    startedAt > 0 &&
    Date.now() - startedAt < LIMITS.minFillMs
  if (website || tooFast) {
    return kind === 'form'
      ? NextResponse.redirect(sentUrl, 303)
      : json({ ok: true }, 200)
  }

  const limit = checkRateLimit(clientKey(request.headers))
  if (!limit.ok) {
    return json(
      { ok: false, error: 'rate_limited', retryAfter: limit.retryAfterSeconds },
      429,
      { 'retry-after': String(limit.retryAfterSeconds) }
    )
  }

  const result = subscribeSchema.safeParse(data)
  if (!result.success) {
    return json({ ok: false, error: 'invalid' }, 400)
  }

  const token = createToken(result.data.email, result.data.locale)
  if (!token && process.env.NODE_ENV === 'production') {
    console.error('[newsletter] NEWSLETTER_TOKEN_SECRET missing in production')
    return json({ ok: false, error: 'unavailable' }, 503)
  }

  // Confirmation links point at this deployment so preview/dev flows work;
  // in production that is the canonical host.
  const confirmUrl = new URL(
    `/api/newsletter/confirm?token=${encodeURIComponent(token ?? 'dev-token')}`,
    process.env.VERCEL_ENV === 'production' ? site.url : request.url
  ).toString()

  const sent = await sendConfirmation(
    result.data.email,
    result.data.locale,
    confirmUrl
  )
  if (!sent.ok) {
    const status = sent.reason === 'unavailable' ? 503 : 502
    return json({ ok: false, error: sent.reason }, status)
  }

  return kind === 'form'
    ? NextResponse.redirect(sentUrl, 303)
    : json({ ok: true }, 200)
}
