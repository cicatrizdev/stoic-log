import { cache } from 'react'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import { locales, defaultLocale, type Locale } from '@/lib/i18n'
import { isTagSlug, type TagSlug } from '@/content/tags'
import { isSeriesSlug, type SeriesSlug } from '@/content/series'
import { frontmatterSchema, type Frontmatter } from './schema'
import { readingMinutes } from './reading-time'

export type PostVersion = {
  frontmatter: Frontmatter
  /** MDX body, frontmatter already stripped. */
  source: string
  minutes: number
}

export type PostEntry = {
  slug: string
  versions: Partial<Record<Locale, PostVersion>>
  availableLocales: Locale[]
  /**
   * Taxonomy and sort date come from one canonical version (en, else pt) so
   * the two translations can never disagree about where the post belongs.
   */
  canonical: PostVersion
}

/** A post as seen from one locale — possibly falling back to the original. */
export type ResolvedPost = {
  slug: string
  requested: Locale
  actual: Locale
  isFallback: boolean
  availableLocales: Locale[]
  frontmatter: Frontmatter
  source: string
  minutes: number
  canonical: Frontmatter
}

const POSTS_DIR = join(process.cwd(), 'content/posts')

/** Drafts exist everywhere except the production deployment. */
const includeDrafts = process.env.VERCEL_ENV !== 'production'

class ContentError extends Error {
  constructor(problems: string[]) {
    super(`Invalid content in content/posts:\n  - ${problems.join('\n  - ')}`)
    this.name = 'ContentError'
  }
}

/**
 * Scan, parse and validate every post once per render pass. Any violation
 * throws, which fails `next build` — the build is the content gate.
 */
export const getEntries = cache(async (): Promise<PostEntry[]> => {
  const problems: string[] = []
  const entries: PostEntry[] = []
  const dirs = (await readdir(POSTS_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  for (const slug of dirs) {
    const versions: Partial<Record<Locale, PostVersion>> = {}
    for (const locale of locales) {
      const path = join(POSTS_DIR, slug, `${locale}.mdx`)
      let raw: string
      try {
        raw = await readFile(path, 'utf8')
      } catch {
        continue
      }
      const { data, content } = matter(raw)
      const parsed = frontmatterSchema.safeParse(data)
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          problems.push(
            `${slug}/${locale}.mdx: ${issue.path.join('.') || 'frontmatter'} — ${issue.message}`
          )
        }
        continue
      }
      const frontmatter = parsed.data
      for (const tag of frontmatter.tags) {
        if (!isTagSlug(tag)) {
          problems.push(
            `${slug}/${locale}.mdx: unknown tag "${tag}" — register it in src/content/tags.ts`
          )
        }
      }
      if (frontmatter.series && !isSeriesSlug(frontmatter.series)) {
        problems.push(
          `${slug}/${locale}.mdx: unknown series "${frontmatter.series}" — register it in src/content/series.ts`
        )
      }
      versions[locale] = {
        frontmatter,
        source: content,
        minutes: readingMinutes(content),
      }
    }

    const available = locales.filter((l) => versions[l])
    if (available.length === 0) {
      problems.push(`${slug}: no valid ${locales.join('/')} .mdx file`)
      continue
    }
    const canonical = (versions[defaultLocale] ?? versions[available[0]!])!
    const other = available
      .map((l) => versions[l]!)
      .find((v) => v !== canonical)
    if (
      other &&
      (other.frontmatter.series !== canonical.frontmatter.series ||
        other.frontmatter.seriesOrder !== canonical.frontmatter.seriesOrder)
    ) {
      problems.push(
        `${slug}: translations disagree about series/seriesOrder — they must match`
      )
    }
    entries.push({ slug, versions, availableLocales: available, canonical })
  }

  const orders = new Map<string, string>()
  for (const entry of entries) {
    const { series, seriesOrder } = entry.canonical.frontmatter
    if (!series || seriesOrder === undefined) continue
    const key = `${series}#${seriesOrder}`
    const holder = orders.get(key)
    if (holder) {
      problems.push(
        `${entry.slug}: seriesOrder ${seriesOrder} in "${series}" already used by ${holder}`
      )
    }
    orders.set(key, entry.slug)
  }

  if (problems.length > 0) throw new ContentError(problems)

  const isDraft = (e: PostEntry) =>
    e.availableLocales.some((l) => e.versions[l]!.frontmatter.draft)
  return entries.filter((e) => includeDrafts || !isDraft(e))
})

function resolve(entry: PostEntry, locale: Locale): ResolvedPost {
  const actual = entry.versions[locale] ? locale : entry.availableLocales[0]!
  const version = entry.versions[actual]!
  return {
    slug: entry.slug,
    requested: locale,
    actual,
    isFallback: actual !== locale,
    availableLocales: entry.availableLocales,
    frontmatter: version.frontmatter,
    source: version.source,
    minutes: version.minutes,
    canonical: entry.canonical.frontmatter,
  }
}

/** All posts as seen from `locale`, newest first. */
export async function listPosts(locale: Locale): Promise<ResolvedPost[]> {
  const entries = await getEntries()
  return entries
    .map((e) => resolve(e, locale))
    .sort((a, b) => b.canonical.date.localeCompare(a.canonical.date))
}

export async function getPost(
  slug: string,
  locale: Locale
): Promise<ResolvedPost | null> {
  const entries = await getEntries()
  const entry = entries.find((e) => e.slug === slug)
  return entry ? resolve(entry, locale) : null
}

export async function listSlugs(): Promise<string[]> {
  return (await getEntries()).map((e) => e.slug)
}

export async function postsByTag(
  tag: TagSlug,
  locale: Locale
): Promise<ResolvedPost[]> {
  return (await listPosts(locale)).filter((p) => p.canonical.tags.includes(tag))
}

export async function postsBySeries(
  series: SeriesSlug,
  locale: Locale
): Promise<ResolvedPost[]> {
  return (await listPosts(locale))
    .filter((p) => p.canonical.series === series)
    .sort((a, b) => a.canonical.seriesOrder! - b.canonical.seriesOrder!)
}

export type SeriesPosition = {
  series: SeriesSlug
  index: number
  total: number
  prev: ResolvedPost | null
  next: ResolvedPost | null
}

export async function seriesPosition(
  post: ResolvedPost,
  locale: Locale
): Promise<SeriesPosition | null> {
  const slug = post.canonical.series
  if (!slug || !isSeriesSlug(slug)) return null
  const posts = await postsBySeries(slug, locale)
  const index = posts.findIndex((p) => p.slug === post.slug)
  return {
    series: slug,
    index: index + 1,
    total: posts.length,
    prev: index > 0 ? posts[index - 1]! : null,
    next: index < posts.length - 1 ? posts[index + 1]! : null,
  }
}
