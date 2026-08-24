import type { Locale } from '@/lib/i18n'
import { getUi } from '@/content'
import styles from './TranslationNotice.module.css'

/** Shown when an entry falls back to its original language. */
export function TranslationNotice({ locale }: { locale: Locale }) {
  const ui = getUi(locale)
  return <p className={styles.notice}>{ui.post.translationNotice}</p>
}
