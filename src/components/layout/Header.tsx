import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { getUi } from '@/content'
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import styles from './Header.module.css'

export function Header({ locale }: { locale: Locale }) {
  const ui = getUi(locale)
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={`/${locale}`} className={styles.wordmark}>
          stoic<span className={styles.dot}>.</span>log
        </Link>
        <nav className={styles.nav} aria-label={ui.nav.ariaLabel}>
          <Link href={`/${locale}/posts`}>{ui.nav.posts}</Link>
          <Link href={`/${locale}/series`}>{ui.nav.series}</Link>
          <Link href={`/${locale}/tags`}>{ui.nav.tags}</Link>
          <Link href={`/${locale}/search`}>{ui.nav.search}</Link>
        </nav>
        <div className={styles.controls}>
          <LocaleSwitcher locale={locale} label={ui.chrome.localeLabel} />
          <ThemeToggle
            label={ui.chrome.themeLabel}
            light={ui.chrome.themeLight}
            dark={ui.chrome.themeDark}
          />
        </div>
      </div>
    </header>
  )
}
