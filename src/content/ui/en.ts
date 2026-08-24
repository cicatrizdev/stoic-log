import type { UiStrings } from '@/content/types'

export const en: UiStrings = {
  meta: {
    title: 'stoic.log — practical philosophy for people who build software',
    description:
      'Essays on Stoicism applied to building software: incidents, careers, legacy code and the discipline of the craft.',
  },
  chrome: {
    skipToContent: 'Skip to content',
    themeLabel: 'Toggle color theme',
    themeLight: 'light',
    themeDark: 'dark',
    localeLabel: 'Mudar para português',
  },
  nav: {
    posts: 'posts',
    series: 'tracks',
    tags: 'tags',
    search: 'search',
    newsletter: 'newsletter',
    ariaLabel: 'Main navigation',
  },
  home: {
    eyebrow: '$ tail -f stoic.log',
    manifesto: [
      'Marcus Aurelius wrote his Meditations as a private journal — a log. This is mine: Stoic philosophy applied to the daily practice of building software.',
      'You do not control the roadmap, the market or the pager. You control your craft, your judgment and your response. This log is about that second list.',
    ],
    latest: 'Latest entries',
    allPosts: 'all posts',
    seriesTitle: 'Tracks',
    allSeries: 'all tracks',
  },
  post: {
    minRead: 'min read',
    updated: 'updated',
    draft: 'draft',
    translationNotice:
      'This entry has not been translated yet — showing the original.',
    seriesLabel: 'track',
    seriesProgress: 'part {n} of {m}',
    prev: 'previous',
    next: 'next',
    comments: 'Comments',
  },
  archive: {
    title: 'All posts',
    empty: 'Nothing here yet. The discipline is in the returning.',
  },
  tags: {
    title: 'Tags',
    count: '{count} entries',
  },
  series: {
    title: 'Tracks',
    blurb:
      'Ordered sequences of entries, each exploring one Stoic practice applied to software.',
    count: '{count} parts',
  },
  search: {
    title: 'Search',
    placeholder: 'Search entries…',
    noResults: 'No entries found for',
    hint: 'Search runs locally — nothing leaves your browser.',
  },
  newsletter: {
    title: 'Newsletter',
    blurb:
      'One essay every other week, in your inbox. Consistency over reach — no noise, no spam, unsubscribe anytime.',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    submit: 'subscribe',
    sending: 'sending…',
    sentTitle: 'Check your inbox',
    sentBody:
      'We sent you a confirmation link. It expires in 24 hours — nothing is sent until you click it.',
    confirmedTitle: 'Subscription confirmed',
    confirmedBody: 'Welcome. The next entry lands in your inbox.',
    backHome: 'back to the log',
    errorInvalid: 'That email address does not look right.',
    errorRateLimited: 'Too many attempts — try again in a few minutes.',
    errorFailed: 'Could not subscribe right now. Try again later.',
  },
  footer: {
    rss: 'rss',
    source: 'source',
    colophon: 'a log by',
  },
  notFound: {
    title: '404 — entry not found',
    body: 'Nothing lives at this path.',
    back: 'back to the log',
    flavor: '“Loss is nothing else but change.” — Marcus Aurelius',
  },
}
