import type { Metadata } from 'next'
import { isLocale, defaultLocale, type Locale } from '@/lib/i18n'
import { getUi } from '@/content'
import { getPost, listSlugs, seriesPosition } from '@/lib/posts'
import { compilePost } from '@/lib/posts/mdx'
import { buildPostMetadata } from '@/lib/metadata'
import { mdxComponents } from '@/components/mdx/mdx-components'
import { PostMeta } from '@/components/post/PostMeta'
import { Soundtrack } from '@/components/post/Soundtrack'
import { TagList } from '@/components/post/TagList'
import { TranslationNotice } from '@/components/post/TranslationNotice'
import { SeriesNav } from '@/components/post/SeriesNav'
import { Giscus } from '@/components/comments/Giscus'
import { SubscribeForm } from '@/components/newsletter/SubscribeForm'
import { PostJsonLd } from '@/components/seo/JsonLd'
import styles from './page.module.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await listSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const post = await getPost(slug, locale)
  return post ? buildPostMetadata(post, locale) : {}
}

export default async function PostPage({ params }: Props) {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  const post = (await getPost(slug, locale))!
  const [Content, position] = await Promise.all([
    compilePost(post.source),
    seriesPosition(post, locale),
  ])

  return (
    <article className={styles.article} lang={post.actual}>
      <PostJsonLd post={post} locale={locale} />

      <header className={styles.header}>
        <PostMeta post={post} locale={locale} />
        <h1 className={styles.title}>{post.frontmatter.title}</h1>
        <p className={styles.description}>{post.frontmatter.description}</p>
      </header>

      {post.isFallback && <TranslationNotice locale={locale} />}

      {post.frontmatter.soundtrack && (
        <Soundtrack
          url={post.frontmatter.soundtrack.url}
          title={post.frontmatter.soundtrack.title}
          label={ui.post.soundtrack}
          playLabel={ui.post.soundtrackPlay}
        />
      )}

      <div className="prose">
        <Content components={mdxComponents} />
      </div>

      <footer className={styles.footer}>
        <TagList slugs={post.canonical.tags} locale={locale} />
        {position && <SeriesNav position={position} locale={locale} />}

        <section className={styles.newsletter}>
          <p className={styles.newsletterBlurb}>{ui.newsletter.blurb}</p>
          <SubscribeForm locale={locale} labels={ui.newsletter} />
        </section>

        <section aria-label={ui.post.comments}>
          <h2 className={styles.commentsTitle}>{ui.post.comments}</h2>
          <Giscus slug={post.slug} locale={locale} />
        </section>
      </footer>
    </article>
  )
}
