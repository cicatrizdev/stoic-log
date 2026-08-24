import type { ReactNode } from 'react'
import styles from './Callout.module.css'

/**
 * Aside box with a mono label. Usage in MDX:
 * `<Callout label="na prática">…</Callout>`.
 */
export function Callout({
  children,
  label = 'note',
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <aside className={styles.callout}>
      <p className={styles.label}>{label}</p>
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
