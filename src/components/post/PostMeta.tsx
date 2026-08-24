import type { Locale } from '@/lib/i18n'
import { formatDate } from '@/lib/i18n'
import { getUi } from '@/content'
import type { ResolvedPost } from '@/lib/posts'
import styles from './PostMeta.module.css'

/** The mono metadata line — the terminal half of the identity. */
export function PostMeta({
  post,
  locale,
}: {
  post: ResolvedPost
  locale: Locale
}) {
  const ui = getUi(locale)
  const { frontmatter } = post
  return (
    <p className={styles.meta}>
      <time dateTime={frontmatter.date}>
        {formatDate(frontmatter.date, locale)}
      </time>
      <span className={styles.sep} aria-hidden="true">
        ·
      </span>
      <span>
        {post.minutes} {ui.post.minRead}
      </span>
      {frontmatter.updated && (
        <>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <span>
            {ui.post.updated}{' '}
            <time dateTime={frontmatter.updated}>
              {formatDate(frontmatter.updated, locale)}
            </time>
          </span>
        </>
      )}
      {post.isFallback && <span className={styles.badge}>{post.actual}</span>}
      {frontmatter.draft && (
        <span className={styles.badge}>{ui.post.draft}</span>
      )}
    </p>
  )
}
