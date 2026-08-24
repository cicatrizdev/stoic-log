import Link from 'next/link'
import { isLocale, defaultLocale, type Locale } from '@/lib/i18n'
import { getUi, series as seriesRegistry } from '@/content'
import { listPosts } from '@/lib/posts'
import { isSeriesSlug, type SeriesSlug } from '@/content/series'
import { PostCard } from '@/components/post/PostCard'
import { SubscribeForm } from '@/components/newsletter/SubscribeForm'
import { BlogJsonLd } from '@/components/seo/JsonLd'
import styles from './page.module.css'

const LATEST_COUNT = 5

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  const posts = await listPosts(locale)
  const latest = posts.slice(0, LATEST_COUNT)
  const activeSeries = [
    ...new Set(
      posts
        .map((p) => p.canonical.series)
        .filter((s): s is SeriesSlug => Boolean(s) && isSeriesSlug(s!))
    ),
  ]

  return (
    <>
      <BlogJsonLd locale={locale} />

      <section className={styles.hero}>
        <p className={styles.eyebrow} aria-hidden="true">
          {ui.home.eyebrow}
        </p>
        <h1 className="sr-only">stoic.log</h1>
        {ui.home.manifesto.map((paragraph, i) => (
          <p
            key={i}
            className={i === 0 ? styles.manifestoLead : styles.manifesto}
          >
            {paragraph}
          </p>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{ui.home.latest}</h2>
        <div className={styles.postList}>
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} locale={locale} />
          ))}
        </div>
        <p className={styles.more}>
          <Link href={`/${locale}/posts`}>{ui.home.allPosts} →</Link>
        </p>
      </section>

      {activeSeries.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{ui.home.seriesTitle}</h2>
          <ul className={styles.seriesList}>
            {activeSeries.map((slug) => (
              <li key={slug} className={styles.seriesItem}>
                <Link
                  className={styles.seriesTitle}
                  href={`/${locale}/series/${slug}`}
                >
                  {seriesRegistry[slug].title[locale]}
                </Link>
                <p className={styles.seriesDescription}>
                  {seriesRegistry[slug].description[locale]}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{ui.newsletter.title}</h2>
        <p className={styles.newsletterBlurb}>{ui.newsletter.blurb}</p>
        <SubscribeForm locale={locale} labels={ui.newsletter} />
      </section>
    </>
  )
}
