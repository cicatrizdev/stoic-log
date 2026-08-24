import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale, defaultLocale, fmt, type Locale } from '@/lib/i18n'
import { getUi, tags as tagRegistry } from '@/content'
import { isTagSlug, type TagSlug } from '@/content/tags'
import { listPosts } from '@/lib/posts'
import styles from './page.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  return {
    title: getUi(locale).tags.title,
    alternates: { canonical: `/${locale}/tags` },
  }
}

export default async function TagsIndex({ params }: Props) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  const posts = await listPosts(locale)
  const counts = new Map<TagSlug, number>()
  for (const post of posts) {
    for (const tag of post.canonical.tags) {
      if (isTagSlug(tag)) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  const used = [...counts.entries()].sort((a, b) => b[1] - a[1])

  return (
    <>
      <h1 className={styles.title}>{ui.tags.title}</h1>
      <ul className={styles.list}>
        {used.map(([slug, count]) => (
          <li key={slug} className={styles.item}>
            <Link className={styles.tag} href={`/${locale}/tags/${slug}`}>
              #{tagRegistry[slug].label[locale]}
            </Link>
            <span className={styles.count}>
              {fmt(ui.tags.count, { count })}
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}
