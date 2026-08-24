import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { ResolvedPost } from '@/lib/posts'
import { PostMeta } from './PostMeta'
import styles from './PostCard.module.css'

export function PostCard({
  post,
  locale,
}: {
  post: ResolvedPost
  locale: Locale
}) {
  return (
    <article className={styles.card}>
      <PostMeta post={post} locale={locale} />
      <h3 className={styles.title}>
        <Link href={`/${locale}/posts/${post.slug}`}>
          {post.frontmatter.title}
        </Link>
      </h3>
      <p className={styles.description}>{post.frontmatter.description}</p>
    </article>
  )
}
