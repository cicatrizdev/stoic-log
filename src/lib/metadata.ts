import type { Metadata } from 'next'
import { langTag, ogLocale, otherLocale, type Locale } from '@/lib/i18n'
import { site, getUi } from '@/content'
import type { ResolvedPost } from '@/lib/posts'

export const metadataBase = new URL(site.url)

export function buildMetadata(locale: Locale): Metadata {
  const ui = getUi(locale)
  const other = otherLocale(locale)
  return {
    metadataBase,
    title: {
      default: ui.meta.title,
      template: `%s · ${site.name}`,
    },
    description: ui.meta.description,
    applicationName: site.name,
    authors: [{ name: site.author, url: site.authorUrl }],
    creator: site.author,
    keywords: [
      'stoicism',
      'estoicismo',
      'software engineering',
      'philosophy',
      'developer career',
      'incidents',
      'Pedro Mello',
      'Cicatriz',
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        [langTag.en]: '/en',
        [langTag.pt]: '/pt',
        'x-default': '/en',
      },
      types: {
        'application/rss+xml': `/${locale}/rss.xml`,
      },
    },
    openGraph: {
      type: 'website',
      url: `/${locale}`,
      siteName: site.name,
      title: ui.meta.title,
      description: ui.meta.description,
      locale: ogLocale[locale],
      alternateLocale: [ogLocale[other]],
    },
    twitter: {
      card: 'summary_large_image',
      title: ui.meta.title,
      description: ui.meta.description,
    },
    robots: { index: true, follow: true },
  }
}

export function buildPostMetadata(
  post: ResolvedPost,
  locale: Locale
): Metadata {
  const path = `/${locale}/posts/${post.slug}`
  const languages: Record<string, string> = {}
  for (const l of post.availableLocales) {
    languages[langTag[l]] = `/${l}/posts/${post.slug}`
  }
  const xDefault = post.availableLocales.includes('en')
    ? 'en'
    : post.availableLocales[0]!
  languages['x-default'] = `/${xDefault}/posts/${post.slug}`

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: {
      // A fallback page canonicalizes to the real-language URL, so the
      // untranslated copy never competes with the original in search.
      canonical: post.isFallback ? `/${post.actual}/posts/${post.slug}` : path,
      languages,
    },
    openGraph: {
      type: 'article',
      url: path,
      siteName: site.name,
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      locale: ogLocale[post.actual],
      publishedTime: post.frontmatter.date,
      modifiedTime: post.frontmatter.updated ?? post.frontmatter.date,
      authors: [site.authorUrl],
      tags: [...post.canonical.tags],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.description,
    },
    robots: post.isFallback
      ? { index: false, follow: true }
      : { index: true, follow: true },
  }
}
