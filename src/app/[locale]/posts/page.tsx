import type { Metadata } from 'next'
import { isLocale, defaultLocale, type Locale } from '@/lib/i18n'
import { getUi } from '@/content'
import { listPosts, type ResolvedPost } from '@/lib/posts'
import { PostCard } from '@/components/post/PostCard'
import styles from './page.module.css'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  return {
    title: ui.archive.title,
    alternates: { canonical: `/${locale}/posts` },
  }
}

function byYear(posts: ResolvedPost[]): [string, ResolvedPost[]][] {
  const groups = new Map<string, ResolvedPost[]>()
  for (const post of posts) {
    const year = post.canonical.date.slice(0, 4)
    const group = groups.get(year) ?? []
    group.push(post)
    groups.set(year, group)
  }
  return [...groups.entries()]
}

export default async function Archive({ params }: Props) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  const posts = await listPosts(locale)

  return (
    <>
      <h1 className={styles.title}>{ui.archive.title}</h1>
      {posts.length === 0 && <p className={styles.empty}>{ui.archive.empty}</p>}
      {byYear(posts).map(([year, group]) => (
        <section key={year} className={styles.year}>
          <h2 className={styles.yearTitle}>{year}</h2>
          <div className={styles.postList}>
            {group.map((post) => (
              <PostCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
