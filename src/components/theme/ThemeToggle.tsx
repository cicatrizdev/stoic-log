'use client'

import styles from './ThemeToggle.module.css'

type Props = {
  label: string
  light: string
  dark: string
}

function isDark(root: HTMLElement): boolean {
  if (root.dataset.theme === 'dark') return true
  if (root.dataset.theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function toggle() {
  const root = document.documentElement
  const next = isDark(root) ? 'light' : 'dark'
  root.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch {
    /* private mode, quota — the attribute still applied */
  }
}

/**
 * Renders identical markup on server and client; which label is visible is
 * decided purely by CSS from `[data-theme]`, so there is nothing to hydrate.
 */
export function ThemeToggle({ label, light, dark }: Props) {
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
    >
      <span className={styles.flag} aria-hidden="true">
        --theme=
      </span>
      <span className={styles.whenDark}>{dark}</span>
      <span className={styles.whenLight}>{light}</span>
    </button>
  )
}
