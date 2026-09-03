/**
 * Sends the newsletter edition for freshly published posts: one Resend
 * broadcast per locale, to that locale's audience. Run by the publish
 * workflow right after the draft flags are flipped and pushed.
 *
 * Usage: node scripts/broadcast.mjs [--dry-run] [--no-wait] [--test] <slug>...
 *   --dry-run  print what would be sent, call no API
 *   --no-wait  skip waiting for the post URL to be live (post already deployed)
 *   --test     unique broadcast name (bypasses the resend guard) and no wait —
 *              for template previews against an audience that only contains you
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
const isTest = args.includes('--test')
const noWait = args.includes('--no-wait') || isTest
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
    minutes: (m) => `${m} min de leitura`,
    unsubscribe: 'cancelar assinatura',
  },
  en: {
    intro: 'New essay is up:',
    cta: 'read the essay →',
    minutes: (m) => `${m} min read`,
    unsubscribe: 'unsubscribe',
  },
}

/** The classical quote that opens the essay — the email opens the same way. */
function extractEpigraph(source) {
  const m = /<Epigraph\s+source="([^"]+)"\s*>([\s\S]*?)<\/Epigraph>/.exec(
    source
  )
  if (!m) return null
  return { source: m[1], text: m[2].replace(/\s+/g, ' ').trim() }
}

/** Same crude word count the site uses (src/lib/posts/reading-time.ts). */
function readingMinutes(source) {
  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_[\]()`|-]/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function renderHtml(locale, post) {
  const c = copy[locale]
  const { title, description, url, epigraph, minutes } = post
  const parts = [
    '<div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;max-width:560px;margin:0 auto;padding:24px;color:#26251f;line-height:1.6">',
    '<p style="color:#8a8474;margin:0 0 28px">stoic.log</p>',
  ]
  if (epigraph) {
    parts.push(
      '<blockquote style="margin:0 0 28px;padding:0 0 0 16px;border-left:2px solid #a3781f">',
      `<p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:17px;margin:0 0 8px;color:#26251f">${epigraph.text}</p>`,
      `<p style="font-size:12px;color:#8a8474;margin:0">— ${epigraph.source}</p>`,
      '</blockquote>'
    )
  }
  parts.push(
    `<p style="margin:0 0 4px;color:#4a4638">${c.intro}</p>`,
    `<h1 style="font-size:20px;margin:0 0 12px"><a href="${url}" style="color:#26251f">${title}</a></h1>`,
    `<p style="margin:0 0 20px;color:#4a4638">${description}</p>`,
    `<p style="margin:0 0 32px"><a href="${url}" style="color:#a3781f;font-weight:bold">${c.cta}</a> <span style="color:#8a8474;font-size:12px">· ${c.minutes(minutes)}</span></p>`,
    '<hr style="border:none;border-top:1px solid #d8d2c2;margin:0 0 16px">',
    `<p style="font-size:12px;color:#8a8474;margin:0">— Pedro Mello · <a href="${SITE_URL}" style="color:#8a8474">log.cicatriz.dev</a> · <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#8a8474">${c.unsubscribe}</a></p>`,
    '</div>'
  )
  return parts.join('\n')
}

function renderText(locale, post) {
  const c = copy[locale]
  const lines = []
  if (post.epigraph) {
    lines.push(`"${post.epigraph.text}"`, `— ${post.epigraph.source}`, '')
  }
  lines.push(
    c.intro,
    '',
    `${post.title} (${c.minutes(post.minutes)})`,
    post.description,
    '',
    post.url
  )
  return lines.join('\n')
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
    const name = isTest
      ? `${slug} (${locale}) test-${Date.now()}`
      : `${slug} (${locale})`
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
      const { data, content } = matter(raw)
      const post = {
        title: data.title,
        description: data.description,
        url: `${SITE_URL}/${locale}/posts/${slug}`,
        epigraph: extractEpigraph(content),
        minutes: readingMinutes(content),
      }
      // The sender name already says stoic.log — the subject is the title.
      const subject = post.title

      if (dryRun) {
        console.log(`would send ${name}: "${subject}" → ${post.url}`)
        continue
      }
      if (await audienceIsEmpty(audienceId)) {
        console.log(`${name}: audience has no subscribers — skipping`)
        continue
      }
      if (!noWait) await waitForLive(post.url)

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
              html: renderHtml(locale, post),
              text: renderText(locale, post),
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
