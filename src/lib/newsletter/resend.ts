import { Resend } from 'resend'
import { site } from '@/content'
import type { Locale, Localized } from '@/lib/i18n'

const apiKey = process.env.RESEND_API_KEY
// Resend's sandbox sender rejects a display name, so the default is the bare address.
const from = process.env.NEWSLETTER_FROM_EMAIL || 'onboarding@resend.dev'

const audienceIds: Record<Locale, string | undefined> = {
  en: process.env.RESEND_AUDIENCE_ID_EN,
  pt: process.env.RESEND_AUDIENCE_ID_PT,
}

type Copy = { subject: string; lines: (url: string) => string[] }

const copy: Localized<Copy> = {
  en: {
    subject: `${site.name} — confirm your subscription`,
    lines: (url) => [
      `You (or someone with your address) asked to subscribe to ${site.name}.`,
      '',
      'Confirm by opening this link — it expires in 24 hours:',
      '',
      url,
      '',
      'If this was not you, ignore this email and nothing will be sent.',
      '',
      `— ${site.author} · ${site.url}`,
    ],
  },
  pt: {
    subject: `${site.name} — confirme sua assinatura`,
    lines: (url) => [
      `Você (ou alguém com o seu endereço) pediu para assinar o ${site.name}.`,
      '',
      'Confirme abrindo este link — ele expira em 24 horas:',
      '',
      url,
      '',
      'Se não foi você, ignore este email e nada será enviado.',
      '',
      `— ${site.author} · ${site.url}`,
    ],
  },
}

export type SendResult =
  | { ok: true; delivered: boolean }
  | { ok: false; reason: 'unavailable' | 'send_failed' }

export async function sendConfirmation(
  email: string,
  locale: Locale,
  confirmUrl: string
): Promise<SendResult> {
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `[newsletter] RESEND_API_KEY missing — confirmation not sent.\n` +
          `  to: ${email} (${locale})\n  link: ${confirmUrl}`
      )
      return { ok: true, delivered: false }
    }
    console.error('[newsletter] RESEND_API_KEY missing in production')
    return { ok: false, reason: 'unavailable' }
  }
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: copy[locale].subject,
    text: copy[locale].lines(confirmUrl).join('\n'),
  })
  if (error) {
    console.error('[newsletter] resend error', error)
    return { ok: false, reason: 'send_failed' }
  }
  return { ok: true, delivered: true }
}

/** Idempotent: an already-subscribed contact counts as success. */
export async function addContact(
  email: string,
  locale: Locale
): Promise<boolean> {
  const audienceId = audienceIds[locale]
  if (!apiKey || !audienceId) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[newsletter] would add ${email} to audience ${locale}`)
      return true
    }
    console.error('[newsletter] missing RESEND_API_KEY or audience id')
    return false
  }
  const resend = new Resend(apiKey)
  const { error } = await resend.contacts.create({
    audienceId,
    email,
    unsubscribed: false,
  })
  if (error && !/already|exists/i.test(error.message)) {
    console.error('[newsletter] contacts.create error', error)
    return false
  }
  return true
}
