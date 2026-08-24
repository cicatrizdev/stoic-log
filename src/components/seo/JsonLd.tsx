import type { Locale } from '@/lib/i18n'
import { langTag } from '@/lib/i18n'
import { site, getUi } from '@/content'
import type { ResolvedPost } from '@/lib/posts'

/** All values come from typed site content, never from user input. */
function Script({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

const author = {
  '@type': 'Person',
  name: site.author,
  url: site.authorUrl,
} as const

export function BlogJsonLd({ locale }: { locale: Locale }) {
  const ui = getUi(locale)
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: site.name,
        url: `${site.url}/${locale}`,
        description: ui.meta.description,
        inLanguage: langTag[locale],
        author,
      }}
    />
  )
}

export function PostJsonLd({
  post,
  locale,
}: {
  post: ResolvedPost
  locale: Locale
}) {
  const url = `${site.url}/${locale}/posts/${post.slug}`
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.frontmatter.title,
        description: post.frontmatter.description,
        datePublished: post.frontmatter.date,
        dateModified: post.frontmatter.updated ?? post.frontmatter.date,
        inLanguage: langTag[post.actual],
        url,
        mainEntityOfPage: url,
        image: `${url}/opengraph-image`,
        author,
        publisher: author,
        keywords: post.canonical.tags.join(', '),
      }}
    />
  )
}
