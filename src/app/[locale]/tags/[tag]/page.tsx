import type { Metadata } from 'next'
import { isLocale, defaultLocale, type Locale } from '@/lib/i18n'
import { getUi, tags as tagRegistry } from '@/content'
import { isTagSlug, type TagSlug } from '@/content/tags'
import { listPosts, postsByTag } from '@/lib/posts'
import { PostCard } from '@/components/post/PostCard'
import styles from '../page.module.css'

type Props = { params: Promise<{ locale: string; tag: string }> }

export const dynamicParams = false

/** Only tags actually used by a published post get a page. */
export async function generateStaticParams() {
  const posts = await listPosts(defaultLocale)
  const used = new Set(posts.flatMap((p) => p.canonical.tags))
  return [...used].filter(isTagSlug).map((tag) => ({ tag }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, tag } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const label = isTagSlug(tag) ? tagRegistry[tag].label[locale] : tag
  return {
    title: `#${label} · ${getUi(locale).tags.title}`,
    alternates: { canonical: `/${locale}/tags/${tag}` },
  }
}

export default async function TagPage({ params }: Props) {
  const { locale: raw, tag } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const posts = await postsByTag(tag as TagSlug, locale)
  const label = isTagSlug(tag) ? tagRegistry[tag].label[locale] : tag

  return (
    <>
      <h1 className={styles.title}>#{label}</h1>
      <div className={styles.postList}>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </>
  )
}
