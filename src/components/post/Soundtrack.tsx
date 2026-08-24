'use client'

import { useState } from 'react'
import styles from './Soundtrack.module.css'

type Props = {
  url: string
  title: string
  label: string
  playLabel: string
}

type Embed =
  | { src: string; height: number; aspect?: false }
  | { src: string; aspect: true }

/**
 * Click-to-load facade: no third-party request (and therefore no possible
 * autoplay) until the reader asks for it. The URL is validated by the
 * frontmatter schema, so unknown hosts never reach production.
 */
function toEmbed(url: string): Embed | null {
  const u = new URL(url)
  if (u.hostname === 'open.spotify.com') {
    const parts = u.pathname.split('/').filter(Boolean)
    const kinds = ['track', 'album', 'playlist', 'episode', 'show']
    const idx = parts.findIndex((p) => kinds.includes(p))
    if (idx < 0 || !parts[idx + 1]) return null
    const kind = parts[idx]!
    const compact = kind === 'track' || kind === 'episode'
    return {
      src: `https://open.spotify.com/embed/${kind}/${parts[idx + 1]}`,
      height: compact ? 152 : 352,
    }
  }
  const id =
    u.hostname === 'youtu.be'
      ? u.pathname.split('/').filter(Boolean)[0]
      : u.searchParams.get('v')
  if (!id) return null
  return { src: `https://www.youtube-nocookie.com/embed/${id}`, aspect: true }
}

export function Soundtrack({ url, title, label, playLabel }: Props) {
  const [open, setOpen] = useState(false)
  const embed = toEmbed(url)
  if (!embed) return null

  if (open) {
    return (
      <div className={styles.soundtrack}>
        <iframe
          className={embed.aspect ? styles.frameAspect : styles.frame}
          style={embed.aspect ? undefined : { height: embed.height }}
          src={embed.src}
          title={title}
          loading="lazy"
          allow="encrypted-media; fullscreen; picture-in-picture"
        />
      </div>
    )
  }

  return (
    <div className={styles.soundtrack}>
      <button
        type="button"
        className={styles.facade}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">♫</span>
        <span className={styles.label}>{label}:</span>
        <span className={styles.title}>{title}</span>
        <span className={styles.play} aria-hidden="true">
          ▶
        </span>
        <span className="sr-only">{playLabel}</span>
      </button>
    </div>
  )
}
