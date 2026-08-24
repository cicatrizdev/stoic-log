import type { Metadata, Viewport } from 'next'
import { serif, mono } from '@/lib/fonts'
import { langTag } from '@/lib/i18n'
import { getUi, site } from '@/content'
import { ThemeScript } from '@/components/theme/ThemeScript'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '@/styles/globals.css'
import layout from '@/app/[locale]/layout.module.css'
import styles from './global-not-found.module.css'

/**
 * Routing-level 404 for anything that matches no route — including unknown
 * locales. It bypasses the locale layout, so it is a full document and speaks
 * both languages.
 */
export const metadata: Metadata = {
  title: `404 · ${site.name}`,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { colorScheme: 'light dark' }

export default function GlobalNotFound() {
  const en = getUi('en')
  const pt = getUi('pt')
  return (
    <html
      lang="en"
      className={`${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <Header locale="en" />
        <main id="content" className={layout.page}>
          <p className={styles.status}>HTTP 404</p>
          <h1 className={styles.title}>{en.notFound.title}</h1>
          <p className={styles.flavor}>{en.notFound.flavor}</p>
          <p>
            {en.notFound.body}{' '}
            {/* Plain anchors: this document renders outside the app router. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/en">{en.notFound.back}</a>
          </p>
          <div lang={langTag.pt} className={styles.second}>
            <h2 className={styles.title}>{pt.notFound.title}</h2>
            <p className={styles.flavor}>{pt.notFound.flavor}</p>
            <p>
              {pt.notFound.body}{' '}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/pt">{pt.notFound.back}</a>
            </p>
          </div>
        </main>
        <Footer locale="en" />
      </body>
    </html>
  )
}
