import type { Localized } from '@/lib/i18n'

/**
 * Every user-visible string, per locale. `ui/en.ts` and `ui/pt.ts` must both
 * satisfy this type, so a missing translation is a compile error.
 */
export type UiStrings = {
  meta: {
    title: string
    description: string
  }
  chrome: {
    skipToContent: string
    themeLabel: string
    themeLight: string
    themeDark: string
    localeLabel: string
  }
  nav: {
    posts: string
    series: string
    tags: string
    search: string
    newsletter: string
    ariaLabel: string
  }
  home: {
    /** Decorative terminal line above the manifesto. */
    eyebrow: string
    manifesto: string[]
    latest: string
    allPosts: string
    seriesTitle: string
    allSeries: string
  }
  post: {
    minRead: string
    updated: string
    draft: string
    /** Banner shown when the entry falls back to its original language. */
    translationNotice: string
    seriesLabel: string
    /** Template: `part {n} of {m}`. */
    seriesProgress: string
    soundtrack: string
    soundtrackPlay: string
    prev: string
    next: string
    comments: string
  }
  archive: {
    title: string
    empty: string
  }
  tags: {
    title: string
    /** Template: `{count} entries` under a tag. */
    count: string
  }
  series: {
    title: string
    blurb: string
    /** Template: `{count} parts`. */
    count: string
  }
  search: {
    title: string
    placeholder: string
    noResults: string
    hint: string
  }
  newsletter: {
    title: string
    blurb: string
    emailLabel: string
    emailPlaceholder: string
    submit: string
    sending: string
    sentTitle: string
    sentBody: string
    confirmedTitle: string
    confirmedBody: string
    backHome: string
    errorInvalid: string
    errorRateLimited: string
    errorFailed: string
  }
  footer: {
    rss: string
    source: string
    colophon: string
  }
  notFound: {
    title: string
    body: string
    back: string
    flavor: string
  }
}

export type TagDef = {
  label: Localized
}

export type SeriesDef = {
  title: Localized
  description: Localized
}
