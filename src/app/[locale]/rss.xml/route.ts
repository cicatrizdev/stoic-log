import { locales, isLocale, defaultLocale, langTag } from '@/lib/i18n'
import { site, getUi } from '@/content'
import { listPosts } from '@/lib/posts'

/** Generated at build time; served as a static XML file per locale. */
export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  const posts = await listPosts(locale)
  const feedUrl = `${site.url}/${locale}/rss.xml`

  const items = posts
    .map((post) => {
      const url = `${site.url}/${locale}/posts/${post.slug}`
      const pubDate = new Date(`${post.frontmatter.date}T12:00:00Z`)
      const categories = post.canonical.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n')
      return [
        '    <item>',
        `      <title>${escapeXml(post.frontmatter.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.frontmatter.description)}</description>`,
        `      <pubDate>${pubDate.toUTCString()}</pubDate>`,
        categories,
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(site.name)}</title>`,
    `    <link>${site.url}/${locale}</link>`,
    `    <description>${escapeXml(ui.meta.description)}</description>`,
    `    <language>${langTag[locale]}</language>`,
    `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')

  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  })
}
