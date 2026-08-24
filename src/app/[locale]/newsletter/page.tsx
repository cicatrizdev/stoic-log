import type { Metadata } from 'next'
import { isLocale, defaultLocale, type Locale } from '@/lib/i18n'
import { getUi } from '@/content'
import { SubscribeForm } from '@/components/newsletter/SubscribeForm'
import styles from './page.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  return {
    title: ui.newsletter.title,
    description: ui.newsletter.blurb,
    alternates: { canonical: `/${locale}/newsletter` },
  }
}

export default async function NewsletterPage({ params }: Props) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  return (
    <>
      <h1 className={styles.title}>{ui.newsletter.title}</h1>
      <p className={styles.blurb}>{ui.newsletter.blurb}</p>
      <SubscribeForm locale={locale} labels={ui.newsletter} />
    </>
  )
}
