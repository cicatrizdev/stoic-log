/**
 * Sends the newsletter edition for freshly published posts: one Resend
 * broadcast per locale, to that locale's audience. Run by the publish
 * workflow right after the draft flags are flipped and pushed.
 *
 * Usage: node scripts/broadcast.mjs [--dry-run] [--no-wait] <slug> [slug...]
 *   --dry-run  print what would be sent, call no API
 *   --no-wait  skip waiting for the post URL to be live (post already deployed)
 *
 * Env: RESEND_API_KEY, RESEND_AUDIENCE_ID_PT, RESEND_AUDIENCE_ID_EN,
 *      NEWSLETTER_FROM_EMAIL. A broadcast whose name already exists in
 *      Resend is skipped, so a re-run never emails anyone twice.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'

const SITE_URL = 'https://log.cicatriz.dev'
const POSTS_DIR = join(process.cwd(), 'content/posts')
const LOCALES = ['pt', 'en']
const API = 'https://api.resend.com'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const noWait = args.includes('--no-wait')
const slugs = args.filter((a) => !a.startsWith('--'))

if (slugs.length === 0) {
  console.error(
    'usage: node scripts/broadcast.mjs [--dry-run] [--no-wait] <slug>...'
  )
  process.exit(1)
}

const apiKey = process.env.RESEND_API_KEY
const from = process.env.NEWSLETTER_FROM_EMAIL
const audienceIds = {
  pt: process.env.RESEND_AUDIENCE_ID_PT,
  en: process.env.RESEND_AUDIENCE_ID_EN,
}
if (!dryRun && (!apiKey || !from)) {
  console.error('missing RESEND_API_KEY or NEWSLETTER_FROM_EMAIL')
  process.exit(1)
}

const copy = {
  pt: {
    intro: 'Novo ensaio no ar:',
    cta: 'ler o ensaio →',
    unsubscribe: 'cancelar assinatura',
  },
  en: {
    intro: 'New essay is up:',
    cta: 'read the essay →',
    unsubscribe: 'unsubscribe',
  },
}

function renderHtml(locale, title, description, url) {
  const c = copy[locale]
  return [
    '<div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;max-width:560px;margin:0 auto;padding:24px;color:#26251f;line-height:1.6">',
    '<p style="color:#8a8474;margin:0 0 24px">stoic.log</p>',
    `<p style="margin:0 0 4px">${c.intro}</p>`,
    `<h1 style="font-size:20px;margin:0 0 12px"><a href="${url}" style="color:#26251f">${title}</a></h1>`,
    `<p style="margin:0 0 20px;color:#4a4638">${description}</p>`,
    `<p style="margin:0 0 32px"><a href="${url}" style="color:#a3781f">${c.cta}</a></p>`,
    '<hr style="border:none;border-top:1px solid #d8d2c2;margin:0 0 16px">',
    `<p style="font-size:12px;color:#8a8474;margin:0">— Pedro Mello · <a href="${SITE_URL}" style="color:#8a8474">log.cicatriz.dev</a> · <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#8a8474">${c.unsubscribe}</a></p>`,
    '</div>',
  ].join('\n')
}

function renderText(locale, title, description, url) {
  const c = copy[locale]
  return [c.intro, '', title, description, '', url].join('\n')
}

async function resend(path, init) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`${path}: HTTP ${res.status} ${JSON.stringify(body)}`)
  }
  return body
}

/** Never email a dead link: wait until the post answers 200 in production. */
async function waitForLive(url, timeoutMs = 8 * 60 * 1000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'manual' })
      if (res.status === 200) return
    } catch {
      // network hiccup — keep polling
    }
    console.log(`waiting for ${url} ...`)
    await new Promise((r) => setTimeout(r, 15000))
  }
  throw new Error(`${url} not live after ${timeoutMs / 60000} min`)
}

/** name → { id, status }; a non-draft entry means the edition already went out. */
const existing = new Map(
  dryRun
    ? []
    : ((await resend('/broadcasts')).data ?? []).map((b) => [
        b.name,
        { id: b.id, status: b.status },
      ])
)

async function audienceIsEmpty(audienceId) {
  const { data } = await resend(`/audiences/${audienceId}/contacts`)
  return (data ?? []).every((c) => c.unsubscribed)
}

let failed = false

for (const slug of slugs) {
  for (const locale of LOCALES) {
    const name = `${slug} (${locale})`
    try {
      let raw
      try {
        raw = await readFile(join(POSTS_DIR, slug, `${locale}.mdx`), 'utf8')
      } catch {
        console.log(`${name}: no ${locale} version — skipping`)
        continue
      }
      const audienceId = audienceIds[locale]
      if (!audienceId) {
        console.error(`${name}: missing audience id env — skipping`)
        failed = true
        continue
      }
      const prior = existing.get(name)
      if (prior && prior.status !== 'draft') {
        console.log(`${name}: already ${prior.status} in Resend — skipping`)
        continue
      }
      const { title, description } = matter(raw).data
      const url = `${SITE_URL}/${locale}/posts/${slug}`
      const subject = `stoic.log — ${title}`

      if (dryRun) {
        console.log(`would send ${name}: "${subject}" → ${url}`)
        continue
      }
      if (await audienceIsEmpty(audienceId)) {
        console.log(`${name}: audience has no subscribers — skipping`)
        continue
      }
      if (!noWait) await waitForLive(url)

      // A leftover draft with this name (e.g. a previously failed send) is
      // reused so the edition never goes out twice under two broadcast ids.
      const id =
        prior?.id ??
        (
          await resend('/broadcasts', {
            method: 'POST',
            body: JSON.stringify({
              name,
              audience_id: audienceId,
              from,
              subject,
              html: renderHtml(locale, title, description, url),
              text: renderText(locale, title, description, url),
            }),
          })
        ).id
      await resend(`/broadcasts/${id}/send`, { method: 'POST', body: '{}' })
      console.log(`sent ${name}: broadcast ${id}`)
    } catch (err) {
      // One locale failing must not block the other sends.
      console.error(`${name}: ${err.message}`)
      failed = true
    }
  }
}

process.exit(failed ? 1 : 0)
