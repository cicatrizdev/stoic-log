import { useId } from 'react'
import type { Locale } from '@/lib/i18n'
import { getUi, site } from '@/content'
import styles from './Coffee.module.css'

/**
 * Custom coffee offering — a ceramic cup that fills on hover, linking out to
 * Buy Me a Coffee. No third-party widget, no yellow button.
 */
export function Coffee({ locale }: { locale: Locale }) {
  const ui = getUi(locale)
  return (
    <aside className={`${styles.offering} no-print`}>
      <a
        className={styles.link}
        href={site.coffee}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Cup />
        <span className={styles.copy}>
          <span className={styles.blurb}>{ui.coffee.blurb}</span>
          <span className={styles.cta}>{ui.coffee.cta}</span>
        </span>
      </a>
    </aside>
  )
}

function Cup() {
  const clip = `bowl${useId().replace(/:/g, '')}`
  return (
    <svg
      className={styles.cup}
      viewBox="0 0 80 100"
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <clipPath id={clip}>
          <path d="M22 42h28l-3.2 36.5q-.8 5.5-10.8 5.5t-10.8-5.5Z" />
        </clipPath>
      </defs>
      <g className={styles.steam}>
        <path d="M26 32c-2-8 3-10-1-20" />
        <path d="M36 28c2-9-3-10 1-22" />
        <path d="M46 32c2-8-3-10 1-20" />
      </g>
      <path className={styles.handle} d="M52 50c16-2 17 22-2 26" />
      <path
        className={styles.body}
        d="M19 41h34l-3.6 39q-1 7-13.4 7t-13.4-7Z"
      />
      <g clipPath={`url(#${clip})`}>
        <g className={styles.liquid}>
          <path d="M22 42h28l-3.2 36.5q-.8 5.5-10.8 5.5t-10.8-5.5Z" />
          <ellipse
            className={styles.surface}
            cx="36"
            cy="44"
            rx="13.2"
            ry="3.6"
          />
        </g>
      </g>
      <ellipse className={styles.rim} cx="36" cy="41" rx="17.2" ry="5" />
    </svg>
  )
}
