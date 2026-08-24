import { IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'

/** Prose face: an optical-size serif built for long-form reading on screens. */
export const serif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-source-serif',
  display: 'swap',
})

/** Chrome face: code, metadata and UI — the terminal half of the identity. */
export const mono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600'],
  variable: '--font-plex',
  display: 'swap',
})
