import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale, defaultLocale, fmt, type Locale } from '@/lib/i18n'
import { getUi, series as seriesRegistry } from '@/content'
import { isSeriesSlug, type SeriesSlug } from '@/content/series'
import { listPosts } from '@/lib/posts'
import styles from './page.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  return {
    title: getUi(locale).series.title,
    alternates: { canonical: `/${locale}/series` },
  }
}

export default async function SeriesIndex({ params }: Props) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  const posts = await listPosts(locale)
  const counts = new Map<SeriesSlug, number>()
  for (const post of posts) {
    const slug = post.canonical.series
    if (slug && isSeriesSlug(slug)) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }

  return (
    <>
      <h1 className={styles.title}>{ui.series.title}</h1>
      <p className={styles.blurb}>{ui.series.blurb}</p>
      <ul className={styles.list}>
        {[...counts.entries()].map(([slug, count]) => (
          <li key={slug} className={styles.item}>
            <Link className={styles.name} href={`/${locale}/series/${slug}`}>
              {seriesRegistry[slug].title[locale]}
            </Link>
            <span className={styles.count}>
              {fmt(ui.series.count, { count })}
            </span>
            <p className={styles.description}>
              {seriesRegistry[slug].description[locale]}
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}
