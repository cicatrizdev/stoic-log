'use client'

import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { langTag, otherLocale } from '@/lib/i18n'
import styles from './LocaleSwitcher.module.css'

type Props = {
  locale: Locale
  label: string
}

/**
 * A plain anchor (full navigation) so `<html lang>` and fonts are always
 * consistent with the locale. Route-aware: slugs are shared between locales,
 * so switching is a prefix substitution on the current path. The cookie makes
 * `/` remember the choice.
 */
export function LocaleSwitcher({ locale, label }: Props) {
  const target = otherLocale(locale)
  const pathname = usePathname() ?? `/${locale}`
  const href = pathname.startsWith(`/${locale}`)
    ? `/${target}${pathname.slice(locale.length + 1)}`
    : `/${target}`
  return (
    <a
      className={styles.switch}
      href={href}
      hrefLang={langTag[target]}
      lang={langTag[target]}
      aria-label={label}
      title={label}
      onClick={() => {
        document.cookie = `locale=${target}; path=/; max-age=31536000; SameSite=Lax`
      }}
    >
      <span className={styles.flag} aria-hidden="true">
        --lang=
      </span>
      <span className={styles.value}>{target}</span>
    </a>
  )
}
