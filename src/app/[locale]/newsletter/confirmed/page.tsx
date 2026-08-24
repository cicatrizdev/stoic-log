import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale, defaultLocale, type Locale } from '@/lib/i18n'
import { getUi } from '@/content'
import styles from '../page.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  return {
    title: getUi(locale).newsletter.confirmedTitle,
    robots: { index: false, follow: false },
  }
}

export default async function ConfirmedPage({ params }: Props) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  return (
    <div className={styles.status}>
      <h1 className={styles.title}>{ui.newsletter.confirmedTitle}</h1>
      <p className={styles.statusBody}>{ui.newsletter.confirmedBody}</p>
      <p className={styles.back}>
        <Link href={`/${locale}`}>← {ui.newsletter.backHome}</Link>
      </p>
    </div>
  )
}
