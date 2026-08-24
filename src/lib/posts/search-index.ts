import type { Locale } from '@/lib/i18n'
import { tags as tagRegistry } from '@/content'
import { isTagSlug } from '@/content/tags'
import { listPosts } from './index'

export type SearchDoc = {
  slug: string
  title: string
  description: string
  tags: string[]
  text: string
}

/** MDX body → plain text, good enough for a search index. */
function plainText(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * The per-locale corpus served at `/{locale}/search-index.json`. MiniSearch is
 * built client-side from these docs — for dozens of posts that is instant and
 * keeps the payload plain JSON.
 */
export async function buildSearchDocs(locale: Locale): Promise<SearchDoc[]> {
  const posts = await listPosts(locale)
  return posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    tags: post.canonical.tags
      .filter(isTagSlug)
      .map((t) => tagRegistry[t].label[locale]),
    text: plainText(post.source),
  }))
}
