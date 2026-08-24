import type { MetadataRoute } from 'next'
import { locales, langTag, defaultLocale } from '@/lib/i18n'
import { site } from '@/content'
import { getEntries, listPosts } from '@/lib/posts'
import { isTagSlug } from '@/content/tags'
import { isSeriesSlug } from '@/content/series'

const lastModified = new Date()

function localized(path: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((l) => [langTag[l], `${site.url}/${l}${path}`])
  )
  return locales.map((locale) => ({
    url: `${site.url}/${locale}${path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.6,
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getEntries()
  const posts = await listPosts(defaultLocale)

  const postEntries: MetadataRoute.Sitemap = entries.flatMap((entry) => {
    // Only real translations are listed; fallback copies canonicalize away.
    const languages = Object.fromEntries(
      entry.availableLocales.map((l) => [
        langTag[l],
        `${site.url}/${l}/posts/${entry.slug}`,
      ])
    )
    const { date, updated } = entry.canonical.frontmatter
    return entry.availableLocales.map((locale) => ({
      url: `${site.url}/${locale}/posts/${entry.slug}`,
      lastModified: new Date(`${updated ?? date}T12:00:00Z`),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: { languages },
    }))
  })

  const usedTags = [...new Set(posts.flatMap((p) => p.canonical.tags))].filter(
    isTagSlug
  )
  const usedSeries = [
    ...new Set(
      posts
        .map((p) => p.canonical.series)
        .filter((s): s is string => Boolean(s))
    ),
  ].filter(isSeriesSlug)

  return [
    ...localized(''),
    ...localized('/posts'),
    ...localized('/series'),
    ...localized('/tags'),
    ...localized('/newsletter'),
    ...postEntries,
    ...usedTags.flatMap((tag) => localized(`/tags/${tag}`)),
    ...usedSeries.flatMap((slug) => localized(`/series/${slug}`)),
  ]
}
