import { z } from 'zod'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')

/**
 * Frontmatter contract for `content/posts/<slug>/{en,pt}.mdx`. The slug and
 * language are derived from the path, never declared here, so they cannot drift.
 */
export const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    /** Doubles as the meta description — hence the hard cap. */
    description: z.string().min(1).max(160),
    date: isoDate,
    updated: isoDate.optional(),
    /** Slugs from the registry in `src/content/tags.ts`. */
    tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
    /** Optional per-essay soundtrack, rendered as a click-to-load embed. */
    soundtrack: z
      .object({
        url: z
          .string()
          .regex(
            /^https:\/\/(open\.spotify\.com|www\.youtube\.com|youtu\.be)\//,
            'must be an open.spotify.com or YouTube URL'
          ),
        title: z.string().min(1),
      })
      .optional(),
    /** Slug from the registry in `src/content/series.ts`. */
    series: z.string().optional(),
    seriesOrder: z.number().int().min(1).optional(),
    draft: z.boolean().default(false),
  })
  .refine((f) => (f.series === undefined) === (f.seriesOrder === undefined), {
    message: 'series and seriesOrder must be set together',
  })
  .refine((f) => !f.updated || f.updated >= f.date, {
    message: 'updated must not precede date',
  })

export type Frontmatter = z.infer<typeof frontmatterSchema>
