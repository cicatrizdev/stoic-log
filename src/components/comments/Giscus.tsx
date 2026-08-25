'use client'

import { useEffect, useRef } from 'react'
import type { Locale } from '@/lib/i18n'
import styles from './Giscus.module.css'

/**
 * Hand-rolled giscus embed (no wrapper dependency). One thread per post,
 * shared across locales via `mapping: specific` + `term: post:<slug>`.
 * Renders nothing until the giscus app is configured (env ids present).
 */
const REPO = 'cicatrizdev/stoic-log'
const CATEGORY = 'Comments'
// Public identifiers (they ship in the page HTML either way); env overrides.
const REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? 'R_kgDOUC2Zug'
const CATEGORY_ID =
  process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? 'DIC_kwDOUC2Zus4DEGJt'

const giscusLang: Record<Locale, string> = { en: 'en', pt: 'pt' }

function currentTheme(): string {
  const explicit = document.documentElement.dataset.theme
  if (explicit === 'dark' || explicit === 'light') return explicit
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function GiscusInner({ slug, locale }: { slug: string; locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null)
  const injectedRef = useRef(false)

  useEffect(() => {
    const host = ref.current
    if (!host || injectedRef.current) return
    injectedRef.current = true
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    const attrs: Record<string, string> = {
      'data-repo': REPO,
      'data-repo-id': REPO_ID!,
      'data-category': CATEGORY,
      'data-category-id': CATEGORY_ID!,
      'data-mapping': 'specific',
      'data-term': `post:${slug}`,
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': currentTheme(),
      'data-lang': giscusLang[locale],
      'data-loading': 'lazy',
    }
    for (const [key, value] of Object.entries(attrs)) {
      script.setAttribute(key, value)
    }
    host.appendChild(script)
  }, [slug, locale])

  // Follow the site theme toggle by watching html[data-theme].
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe.giscus-frame'
      )
      iframe?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: currentTheme() } } },
        'https://giscus.app'
      )
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className={styles.giscus} />
}

export function Giscus(props: { slug: string; locale: Locale }) {
  if (!REPO_ID || !CATEGORY_ID) return null
  return <GiscusInner {...props} />
}
