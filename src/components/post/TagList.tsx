import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { tags as tagRegistry } from '@/content'
import { isTagSlug } from '@/content/tags'
import styles from './TagList.module.css'

export function TagList({
  slugs,
  locale,
}: {
  slugs: readonly string[]
  locale: Locale
}) {
  return (
    <ul className={styles.list}>
      {slugs.filter(isTagSlug).map((slug) => (
        <li key={slug}>
          <Link className={styles.tag} href={`/${locale}/tags/${slug}`}>
            #{tagRegistry[slug].label[locale]}
          </Link>
        </li>
      ))}
    </ul>
  )
}
