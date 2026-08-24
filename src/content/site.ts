export const site = {
  /** The wordmark. Also the RSS/OG site name. */
  name: 'stoic.log',
  url: 'https://log.cicatriz.dev',
  author: 'Pedro Mello',
  authorUrl: 'https://cicatriz.dev',
  handle: 'cicatrizdev',
  email: 'contato@cicatriz.dev',
  repo: 'https://github.com/cicatrizdev/stoic-log',
  /** Site-wide reading soundtrack, offered by the header player. */
  soundtrack: {
    url: 'https://open.spotify.com/playlist/3DLg3kfnKptS0KSAVMYuDm',
    title: 'Medieval lofi — Lofi Girl',
  },
  social: {
    github: 'https://github.com/cicatrizdev',
    linkedin: 'https://www.linkedin.com/in/pedro-c-mello',
  },
} as const

export type Site = typeof site
