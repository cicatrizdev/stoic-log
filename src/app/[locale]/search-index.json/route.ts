import { locales, isLocale, defaultLocale } from '@/lib/i18n'
import { buildSearchDocs } from '@/lib/posts/search-index'

/** Generated at build time; served as a static JSON file per locale. */
export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : defaultLocale
  const docs = await buildSearchDocs(locale)
  return Response.json(docs)
}
