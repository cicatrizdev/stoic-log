import type { Metadata } from 'next'
import { isLocale, defaultLocale, type Locale } from '@/lib/i18n'
import { getUi } from '@/content'
import { SearchClient } from '@/components/search/SearchClient'
import styles from './page.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  return {
    title: getUi(locale).search.title,
    alternates: { canonical: `/${locale}/search` },
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ params }: Props) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  return (
    <>
      <h1 className={styles.title}>{ui.search.title}</h1>
      <SearchClient locale={locale} labels={ui.search} />
    </>
  )
}
