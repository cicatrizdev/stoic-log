import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { fmt } from '@/lib/i18n'
import { getUi, series as seriesRegistry } from '@/content'
import type { SeriesPosition } from '@/lib/posts'
import styles from './SeriesNav.module.css'

/** "trilha: Dicotomia do Controle — parte 2 de 5" + prev/next within the track. */
export function SeriesNav({
  position,
  locale,
}: {
  position: SeriesPosition
  locale: Locale
}) {
  const ui = getUi(locale)
  const def = seriesRegistry[position.series]
  return (
    <nav className={styles.nav} aria-label={ui.post.seriesLabel}>
      <p className={styles.track}>
        <span className={styles.label}>{ui.post.seriesLabel}:</span>{' '}
        <Link href={`/${locale}/series/${position.series}`}>
          {def.title[locale]}
        </Link>{' '}
        <span className={styles.progress}>
          —{' '}
          {fmt(ui.post.seriesProgress, {
            n: position.index,
            m: position.total,
          })}
        </span>
      </p>
      <div className={styles.bar} aria-hidden="true">
        <div
          className={styles.fill}
          style={{ width: `${(position.index / position.total) * 100}%` }}
        />
      </div>
      <div className={styles.siblings}>
        {position.prev ? (
          <Link
            className={styles.prev}
            href={`/${locale}/posts/${position.prev.slug}`}
            rel="prev"
          >
            ← {position.prev.frontmatter.title}
          </Link>
        ) : (
          <span />
        )}
        {position.next && (
          <Link
            className={styles.next}
            href={`/${locale}/posts/${position.next.slug}`}
            rel="next"
          >
            {position.next.frontmatter.title} →
          </Link>
        )}
      </div>
    </nav>
  )
}
