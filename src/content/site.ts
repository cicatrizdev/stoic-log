export const site = {
  /** The wordmark. Also the RSS/OG site name. */
  name: 'stoic.log',
  url: 'https://log.cicatriz.dev',
  author: 'Pedro Mello',
  authorUrl: 'https://cicatriz.dev',
  handle: 'cicatrizdev',
  email: 'contato@cicatriz.dev',
  repo: 'https://github.com/cicatrizdev/stoic-log',
  /**
   * Site-wide reading soundtrack, offered by the header player. A YouTube URL
   * gets play/pause + volume controls (IFrame API); Spotify falls back to the
   * plain embed, which exposes no volume control.
   */
  soundtrack: {
    url: 'https://www.youtube.com/watch?v=IxPANmjPaek',
    title: 'medieval lofi radio — Lofi Girl',
  },
  social: {
    github: 'https://github.com/cicatrizdev',
    linkedin: 'https://www.linkedin.com/in/pedro-c-mello',
  },
} as const

export type Site = typeof site
