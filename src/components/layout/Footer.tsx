import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { getUi, site } from '@/content'
import styles from './Footer.module.css'

export function Footer({ locale }: { locale: Locale }) {
  const ui = getUi(locale)
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.links}>
          <Link href={`/${locale}/newsletter`}>{ui.nav.newsletter}</Link>
          <a href={`/${locale}/rss.xml`}>{ui.footer.rss}</a>
          <a href={site.repo} rel="noopener noreferrer" target="_blank">
            {ui.footer.source}
          </a>
        </p>
        <p className={styles.colophon}>
          {ui.footer.colophon}{' '}
          <a href={site.authorUrl} rel="noopener noreferrer" target="_blank">
            {site.author}
          </a>
        </p>
      </div>
    </footer>
  )
}
