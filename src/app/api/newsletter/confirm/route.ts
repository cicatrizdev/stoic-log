import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/newsletter/token'
import { addContact } from '@/lib/newsletter/resend'

/** Minimal bilingual HTML for invalid/expired links — no locale is trustworthy here. */
function errorPage(request: NextRequest): NextResponse {
  const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>stoic.log</title><style>body{font-family:ui-monospace,Menlo,monospace;background:#12130f;color:#e8e2d4;padding:2rem;line-height:1.6}a{color:#c9973f}</style></head><body><h1>Link inválido ou expirado · Invalid or expired link</h1><p>Assine novamente para receber um novo link. · Subscribe again to get a fresh link.</p><p><a href="${new URL('/pt/newsletter', request.url)}">pt</a> · <a href="${new URL('/en/newsletter', request.url)}">en</a></p></body></html>`
  return new NextResponse(doc, {
    status: 400,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return errorPage(request)

  const verified = verifyToken(token)
  if (!verified) {
    // Dev convenience: without a secret there is nothing to verify.
    if (
      process.env.NODE_ENV !== 'production' &&
      !process.env.NEWSLETTER_TOKEN_SECRET
    ) {
      return NextResponse.redirect(
        new URL('/en/newsletter/confirmed', request.url),
        303
      )
    }
    return errorPage(request)
  }

  const added = await addContact(verified.email, verified.locale)
  if (!added) return errorPage(request)

  return NextResponse.redirect(
    new URL(`/${verified.locale}/newsletter/confirmed`, request.url),
    303
  )
}
