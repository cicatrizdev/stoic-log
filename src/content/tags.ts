import type { TagDef } from '@/content/types'

/**
 * The tag registry. A post may only use slugs registered here — an unknown tag
 * fails the build. One canonical slug serves both locales; labels are localized.
 */
export const tags = {
  stoicism: { label: { en: 'stoicism', pt: 'estoicismo' } },
  incidents: { label: { en: 'incidents', pt: 'incidentes' } },
  career: { label: { en: 'career', pt: 'carreira' } },
  practice: { label: { en: 'practice', pt: 'prática' } },
  'legacy-code': { label: { en: 'legacy code', pt: 'código legado' } },
  hype: { label: { en: 'hype', pt: 'hype' } },
  postmortem: { label: { en: 'post-mortems', pt: 'post-mortems' } },
} as const satisfies Record<string, TagDef>

export type TagSlug = keyof typeof tags

export function isTagSlug(value: string): value is TagSlug {
  return value in tags
}

export const tagSlugs = Object.keys(tags) as TagSlug[]
