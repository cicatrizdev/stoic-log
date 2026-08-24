'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Locale } from '@/lib/i18n'
import type { UiStrings } from '@/content/types'
import styles from './SubscribeForm.module.css'

type Labels = UiStrings['newsletter']
type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Progressive enhancement: without JS the form posts to the API route, which
 * answers with a redirect to the localized "check your inbox" page. With JS we
 * stay on the page, add the bot fill-time signal and show inline status.
 */
export function SubscribeForm({
  locale,
  labels,
}: {
  locale: Locale
  labels: Labels
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const startedAt = useRef(0)

  // The bot fill-time signal: stamped after mount, read only on submit.
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, startedAt: startedAt.current }),
      })
      const body: { ok?: boolean; error?: string } | null = await res
        .json()
        .catch(() => null)
      if (res.ok && body?.ok) {
        setStatus('sent')
        return
      }
      setStatus('error')
      if (body?.error === 'invalid') setError(labels.errorInvalid)
      else if (body?.error === 'rate_limited') setError(labels.errorRateLimited)
      else setError(labels.errorFailed)
    } catch {
      setStatus('error')
      setError(labels.errorFailed)
    }
  }

  if (status === 'sent') {
    return (
      <div className={styles.sent} role="status">
        <p className={styles.sentTitle}>{labels.sentTitle}</p>
        <p className={styles.sentBody}>{labels.sentBody}</p>
      </div>
    )
  }

  return (
    <form
      className={styles.form}
      action="/api/newsletter/subscribe"
      method="post"
      onSubmit={onSubmit}
    >
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: hidden from people, tempting to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={styles.honeypot}
      />
      <div className={styles.row}>
        <label className="sr-only" htmlFor="newsletter-email">
          {labels.emailLabel}
        </label>
        <input
          id="newsletter-email"
          className={styles.email}
          type="email"
          name="email"
          required
          maxLength={200}
          placeholder={labels.emailPlaceholder}
          autoComplete="email"
        />
        <button
          className={styles.submit}
          type="submit"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? labels.sending : labels.submit}
        </button>
      </div>
      {status === 'error' && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
