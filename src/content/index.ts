import type { Locale } from '@/lib/i18n'
import type { UiStrings } from '@/content/types'
import { en } from '@/content/ui/en'
import { pt } from '@/content/ui/pt'
import { site } from '@/content/site'
import { tags } from '@/content/tags'
import { series } from '@/content/series'

const ui: Record<Locale, UiStrings> = { en, pt }

export function getUi(locale: Locale): UiStrings {
  return ui[locale]
}

export { site, tags, series }
