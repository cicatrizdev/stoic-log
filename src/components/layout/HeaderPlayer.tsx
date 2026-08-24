'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './HeaderPlayer.module.css'

type Props = {
  embedSrc: string
  title: string
  openLabel: string
  closeLabel: string
}

/**
 * Site-wide reading soundtrack. The ♫ button toggles a floating mini-player;
 * the third-party iframe only loads on first open (no autoplay, no tracking
 * by default) and is HIDDEN — never unmounted — on close, so the music keeps
 * playing. It also survives internal navigation: the header lives in the
 * locale layout, which the App Router preserves across client-side routes.
 */
export function HeaderPlayer({
  embedSrc,
  title,
  openLabel,
  closeLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  function toggle() {
    setOpen((v) => !v)
    setLoaded(true)
  }

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-pressed={open}
        aria-label={open ? closeLabel : openLabel}
        title={title}
      >
        <span aria-hidden="true">♫</span>
      </button>
      {/* Portaled to <body>: the header's backdrop-filter would otherwise
          become the containing block and hijack position: fixed. Only ever
          rendered after a click, so document is always available. */}
      {loaded &&
        createPortal(
          <aside
            className={styles.panel}
            data-open={open || undefined}
            aria-label={title}
            aria-hidden={!open}
          >
            <div className={styles.bar}>
              <span className={styles.title}>♫ {title}</span>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                tabIndex={open ? 0 : -1}
              >
                ×
              </button>
            </div>
            <iframe
              className={styles.frame}
              src={embedSrc}
              title={title}
              allow="encrypted-media; fullscreen; picture-in-picture"
            />
          </aside>,
          document.body
        )}
    </>
  )
}
