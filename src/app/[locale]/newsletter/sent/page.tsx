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
    title: getUi(locale).newsletter.sentTitle,
    robots: { index: false, follow: false },
  }
}

/** Landing page for the no-JS form path after the confirmation email is sent. */
export default async function SentPage({ params }: Props) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  return (
    <div className={styles.status}>
      <h1 className={styles.title}>{ui.newsletter.sentTitle}</h1>
      <p className={styles.statusBody}>{ui.newsletter.sentBody}</p>
      <p className={styles.back}>
        <Link href={`/${locale}`}>← {ui.newsletter.backHome}</Link>
      </p>
    </div>
  )
}
