'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import type { SoundtrackEmbed } from '@/lib/embed'
import styles from './HeaderPlayer.module.css'

type Labels = {
  open: string
  close: string
  play: string
  pause: string
  volume: string
}

type Props = {
  embed: SoundtrackEmbed
  title: string
  labels: Labels
}

/** The slice of the YouTube IFrame API this player uses. */
type YtPlayer = {
  playVideo(): void
  pauseVideo(): void
  setVolume(volume: number): void
}
type YtNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string
      playerVars: Record<string, number>
      events: {
        onReady: (e: { target: YtPlayer }) => void
        onStateChange: (e: { data: number }) => void
      }
    }
  ) => YtPlayer
  PlayerState: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YtNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApi: Promise<YtNamespace> | null = null

function loadYtApi(): Promise<YtNamespace> {
  ytApi ??= new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT!)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return ytApi
}

const DEFAULT_VOLUME = 60

/**
 * Site-wide reading soundtrack. The ♫ button toggles a floating mini-player;
 * nothing third-party loads until the first click (no autoplay, no tracking
 * by default) and the panel is HIDDEN — never unmounted — on close, so the
 * music keeps playing. It survives internal navigation: the header lives in
 * the locale layout, which the App Router preserves across client routes.
 */
export function HeaderPlayer({ embed, title, labels }: Props) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const holderRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<(YtPlayer & { destroy?(): void }) | null>(null)
  const volumeRef = useRef(DEFAULT_VOLUME)

  useEffect(() => {
    if (!loaded || embed.provider !== 'youtube') return
    let cancelled = false
    void loadYtApi().then((YT) => {
      const holder = holderRef.current
      if (cancelled || !holder || playerRef.current) return
      // YT.Player replaces the node it is given; hand it a child React
      // does not manage so reconciliation never trips over the swap.
      const mount = document.createElement('div')
      holder.appendChild(mount)
      playerRef.current = new YT.Player(mount, {
        videoId: embed.videoId,
        playerVars: { playsinline: 1, controls: 0, rel: 0 },
        events: {
          onReady: (e) => e.target.setVolume(volumeRef.current),
          onStateChange: (e) => setPlaying(e.data === YT.PlayerState.PLAYING),
        },
      })
    })
    return () => {
      cancelled = true
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [loaded, embed])

  function toggle() {
    setOpen((v) => !v)
    setLoaded(true)
  }

  function togglePlay() {
    const player = playerRef.current
    if (!player) return
    if (playing) player.pauseVideo()
    else player.playVideo()
  }

  function onVolume(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value)
    setVolume(next)
    volumeRef.current = next
    playerRef.current?.setVolume(next)
  }

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-pressed={open}
        aria-label={open ? labels.close : labels.open}
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
                aria-label={labels.close}
                tabIndex={open ? 0 : -1}
              >
                ×
              </button>
            </div>
            {embed.provider === 'youtube' ? (
              <>
                <div className={styles.video} ref={holderRef} />
                <div className={styles.controls}>
                  <button
                    type="button"
                    className={styles.playPause}
                    onClick={togglePlay}
                    aria-label={playing ? labels.pause : labels.play}
                    tabIndex={open ? 0 : -1}
                  >
                    {playing ? '⏸' : '▶'}
                  </button>
                  <input
                    className={styles.volume}
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={onVolume}
                    aria-label={labels.volume}
                    tabIndex={open ? 0 : -1}
                  />
                  <span className={styles.volumeValue}>{volume}%</span>
                </div>
              </>
            ) : (
              <iframe
                className={styles.frame}
                src={embed.src}
                title={title}
                allow="encrypted-media; fullscreen; picture-in-picture"
              />
            )}
          </aside>,
          document.body
        )}
    </>
  )
}
