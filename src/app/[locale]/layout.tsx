import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import {
  locales,
  isLocale,
  defaultLocale,
  langTag,
  type Locale,
} from '@/lib/i18n'
import { serif, mono } from '@/lib/fonts'
import { buildMetadata } from '@/lib/metadata'
import { getUi } from '@/content'
import { ThemeScript } from '@/components/theme/ThemeScript'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '@/styles/globals.css'
import '@/styles/prose.css'
import styles from './layout.module.css'

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f3ec' },
    { media: '(prefers-color-scheme: dark)', color: '#12130f' },
  ],
}

/** Only the two locales exist; anything else is a routing-level 404. */
export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale: raw } = await params
  return buildMetadata(isLocale(raw) ? raw : defaultLocale)
}

export default async function RootLayout({ children, params }: Props) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const analyticsOn = Boolean(gaId) && process.env.VERCEL_ENV === 'production'

  return (
    <html
      lang={langTag[locale]}
      className={`${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <a href="#content" className={styles.skip}>
          {ui.chrome.skipToContent}
        </a>
        <Header locale={locale} />
        <main id="content" className={styles.page}>
          {children}
        </main>
        <Footer locale={locale} />
        {analyticsOn && <GoogleAnalytics gaId={gaId!} />}
      </body>
    </html>
  )
}
