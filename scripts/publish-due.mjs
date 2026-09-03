/**
 * Publishes queued drafts whose scheduled date has arrived: a post whose
 * every locale file has `draft: true` and `date <= today` (America/Sao_Paulo)
 * gets the draft flag removed in place. The workflow that runs this daily
 * commits the result; the Vercel build remains the content gate.
 *
 * Usage: node scripts/publish-due.mjs [--dry-run]
 *   PUBLISH_TODAY=YYYY-MM-DD overrides "today" (for testing).
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const POSTS_DIR = join(process.cwd(), 'content/posts')
const LOCALES = ['pt', 'en']
const dryRun = process.argv.includes('--dry-run')

const today =
  process.env.PUBLISH_TODAY ||
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
  console.error(`invalid PUBLISH_TODAY: ${today}`)
  process.exit(1)
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---/

/** @param {string} raw */
function parse(raw) {
  const match = FRONTMATTER.exec(raw)
  if (!match) return null
  const block = match[1]
  const date = /^date:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?\s*$/m.exec(block)?.[1]
  const draft = /^draft:\s*true\s*$/m.test(block)
  return { date, draft }
}

const dirs = (await readdir(POSTS_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()

const published = []

for (const slug of dirs) {
  const files = []
  for (const locale of LOCALES) {
    const path = join(POSTS_DIR, slug, `${locale}.mdx`)
    let raw
    try {
      raw = await readFile(path, 'utf8')
    } catch {
      continue
    }
    const meta = parse(raw)
    if (!meta || !meta.date) {
      console.error(
        `${slug}/${locale}.mdx: unparseable frontmatter — skipping post`
      )
      files.length = 0
      break
    }
    files.push({ path, raw, ...meta })
  }
  if (files.length === 0) continue

  // Due = every locale is a draft whose date has arrived. Mixed draft state
  // never builds anyway; being conservative here keeps this script harmless.
  const due = files.every((f) => f.draft && f.date <= today)
  if (!due) continue

  for (const f of files) {
    const next = f.raw.replace(FRONTMATTER, (block) =>
      block.replace(/\ndraft:\s*true\s*(?=\n)/, '')
    )
    if (next === f.raw) {
      console.error(`${f.path}: could not remove draft flag`)
      process.exit(1)
    }
    if (!dryRun) await writeFile(f.path, next, 'utf8')
  }
  published.push(slug)
}

if (published.length === 0) {
  console.log(`nothing due on ${today}`)
} else {
  const verb = dryRun ? 'would publish' : 'published'
  for (const slug of published) console.log(`${verb}: ${slug}`)
}
