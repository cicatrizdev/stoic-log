export const locales = ['en', 'pt'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export type Localized<T = string> = Record<Locale, T>

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (locales as readonly string[]).includes(value)
  )
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'pt' : 'en'
}

/** BCP 47 tag used for <html lang>, hreflang and Intl APIs. */
export const langTag: Localized = { en: 'en', pt: 'pt-BR' }

/** Open Graph locale codes. */
export const ogLocale: Localized = { en: 'en_US', pt: 'pt_BR' }

/** `fmt('part {n} of {m}', { n: 2, m: 5 })` → `'part 2 of 5'` */
export function fmt(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`
  )
}

export function formatDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString(
    langTag[locale],
    { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
  )
}
