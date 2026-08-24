import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import type { MDXContent } from 'mdx/types'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeShiki from '@shikijs/rehype'

/**
 * Compile + run one MDX body in-process, outside the bundler. This is why the
 * pipeline is hand-rolled: Turbopack only accepts serializable plugin config,
 * while here the plugins are plain functions. Runs during static generation
 * only — every post route is fully static.
 */
export async function compilePost(source: string): Promise<MDXContent> {
  const mod = await evaluate(source, {
    ...runtime,
    baseUrl: import.meta.url,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [
        rehypeShiki,
        {
          themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
          defaultColor: false,
        },
      ],
    ],
  })
  return mod.default
}
