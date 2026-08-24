import { z } from 'zod'
import { locales } from '@/lib/i18n'

export const LIMITS = {
  email: { max: 200 },
  /** Submissions faster than this after render are treated as bots. */
  minFillMs: 2500,
  maxBodyBytes: 8 * 1024,
} as const

export const subscribeSchema = z.object({
  email: z.string().trim().max(LIMITS.email.max).pipe(z.email()),
  locale: z.enum(locales).default('en'),
  /** Honeypot — must stay empty. */
  website: z.string().optional(),
  /** Epoch ms when the form was rendered; set by JS only. */
  startedAt: z.coerce.number().optional(),
})

export type SubscribeInput = z.infer<typeof subscribeSchema>
