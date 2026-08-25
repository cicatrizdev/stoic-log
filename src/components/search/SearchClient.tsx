'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type MiniSearch from 'minisearch'
import type { Locale } from '@/lib/i18n'
import type { UiStrings } from '@/content/types'
import type { SearchDoc } from '@/lib/posts/search-index'
import styles from './SearchClient.module.css'

type Labels = UiStrings['search']
type Hit = Pick<SearchDoc, 'slug' | 'title' | 'description'>

/** Accent-insensitive: "estóico" finds "estoico" and vice versa. */
function processTerm(term: string): string {
  return term
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/**
 * MiniSearch is lazy-loaded and the per-locale index fetched on first focus,
 * then everything runs in the browser — no query ever leaves the page.
 */
export function SearchClient({
  locale,
  labels,
}: {
  locale: Locale
  labels: Labels
}) {
  const [query, setQuery] = useState('')
  const [mini, setMini] = useState<MiniSearch<SearchDoc> | null>(null)
  const [error, setError] = useState(false)
  const loadingRef = useRef(false)

  async function ensureIndex() {
    if (mini || loadingRef.current) return
    loadingRef.current = true
    try {
      const [{ default: Mini }, docs] = await Promise.all([
        import('minisearch'),
        fetch(`/${locale}/search-index.json`).then(
          (r) => r.json() as Promise<SearchDoc[]>
        ),
      ])
      const instance = new Mini<SearchDoc>({
        idField: 'slug',
        fields: ['title', 'description', 'tags', 'text'],
        storeFields: ['slug', 'title', 'description'],
        processTerm,
        extractField: (doc, field) => {
          const value = doc[field as keyof SearchDoc]
          return Array.isArray(value) ? value.join(' ') : String(value ?? '')
        },
        searchOptions: {
          prefix: true,
          fuzzy: 0.15,
          boost: { title: 3, description: 2, tags: 2 },
        },
      })
      instance.addAll(docs)
      setMini(instance)
    } catch {
      setError(true)
    } finally {
      loadingRef.current = false
    }
  }

  const hits: Hit[] =
    mini && query.trim()
      ? mini
          .search(query)
          .slice(0, 20)
          .map((r) => ({
            slug: String(r.slug ?? r.id),
            title: String(r.title ?? ''),
            description: String(r.description ?? ''),
          }))
      : []

  const showEmpty =
    mini !== null && query.trim().length > 0 && hits.length === 0

  return (
    <div className={styles.search}>
      <input
        className={styles.input}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          void ensureIndex()
        }}
        onFocus={() => void ensureIndex()}
        placeholder={labels.placeholder}
        aria-label={labels.title}
        autoFocus
      />
      <p className={styles.hint}>{error ? labels.noResults : labels.hint}</p>
      {showEmpty && (
        <p className={styles.empty}>
          {labels.noResults} <strong>{query}</strong>
        </p>
      )}
      <ul className={styles.results}>
        {hits.map((hit) => (
          <li key={hit.slug} className={styles.result}>
            <Link
              className={styles.resultTitle}
              href={`/${locale}/posts/${hit.slug}`}
            >
              {hit.title}
            </Link>
            <p className={styles.resultDescription}>{hit.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
