import type { ReactNode } from 'react'
import styles from './Epigraph.module.css'

/**
 * Opening quote of an essay: serif italic, mono attribution. Registered in the
 * MDX components map — usage: `<Epigraph source="Marcus Aurelius, Meditations 4.3">…</Epigraph>`.
 */
export function Epigraph({
  children,
  source,
}: {
  children: ReactNode
  source?: string
}) {
  return (
    <figure className={styles.epigraph}>
      <blockquote className={styles.quote}>{children}</blockquote>
      {source && <figcaption className={styles.source}>— {source}</figcaption>}
    </figure>
  )
}
