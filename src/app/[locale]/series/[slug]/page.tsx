import type { Metadata } from 'next'
import { isLocale, defaultLocale, type Locale } from '@/lib/i18n'
import { series as seriesRegistry } from '@/content'
import { isSeriesSlug, type SeriesSlug } from '@/content/series'
import { listPosts, postsBySeries } from '@/lib/posts'
import { PostCard } from '@/components/post/PostCard'
import styles from '../page.module.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = false

/** Only series with at least one published post get a page. */
export async function generateStaticParams() {
  const posts = await listPosts(defaultLocale)
  const used = new Set(
    posts.map((p) => p.canonical.series).filter((s): s is string => Boolean(s))
  )
  return [...used].filter(isSeriesSlug).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  if (!isSeriesSlug(slug)) return {}
  const def = seriesRegistry[slug]
  return {
    title: def.title[locale],
    description: def.description[locale],
    alternates: { canonical: `/${locale}/series/${slug}` },
  }
}

export default async function SeriesPage({ params }: Props) {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const def = seriesRegistry[slug as SeriesSlug]
  const posts = await postsBySeries(slug as SeriesSlug, locale)

  return (
    <>
      <h1 className={styles.title}>{def.title[locale]}</h1>
      <p className={styles.blurb}>{def.description[locale]}</p>
      <div className={styles.postList}>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </>
  )
}
