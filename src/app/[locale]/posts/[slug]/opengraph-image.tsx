import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { isLocale, defaultLocale, fmt, formatDate } from '@/lib/i18n'
import { site, getUi, series as seriesRegistry } from '@/content'
import { getPost, listSlugs, seriesPosition } from '@/lib/posts'

export const alt = 'stoic.log'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  const slugs = await listSlugs()
  return slugs.map((slug) => ({ slug }))
}

const serifDir = join(
  process.cwd(),
  'node_modules/@fontsource/source-serif-4/files'
)
const monoDir = join(
  process.cwd(),
  'node_modules/@fontsource/ibm-plex-mono/files'
)
// Static-weight .woff on purpose: satori reads neither woff2 nor variable fonts.
const [serifSemibold, monoRegular] = await Promise.all([
  readFile(join(serifDir, 'source-serif-4-latin-600-normal.woff')),
  readFile(join(monoDir, 'ibm-plex-mono-latin-400-normal.woff')),
])

const colors = {
  bg: '#12130f',
  fg: '#e8e2d4',
  dim: '#8a8574',
  accent: '#c9973f',
  rule: '#2c2d25',
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  const locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  const post = (await getPost(slug, locale))!
  const position = await seriesPosition(post, locale)

  // Satori lays out nested inline text poorly: render word by word in a wrapping flex row.
  const titleWords = post.frontmatter.title.split(' ')
  const metaParts = [
    formatDate(post.frontmatter.date, locale),
    `${post.minutes} ${ui.post.minRead}`,
  ]
  if (position) {
    metaParts.push(
      `${seriesRegistry[position.series].title[locale]} — ${fmt(
        ui.post.seriesProgress,
        { n: position.index, m: position.total }
      )}`
    )
  }

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: colors.bg,
        color: colors.fg,
        padding: '64px 80px',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontFamily: 'Mono',
          fontSize: 26,
          borderBottom: `2px solid ${colors.rule}`,
          paddingBottom: 24,
        }}
      >
        <span style={{ fontWeight: 400 }}>stoic</span>
        <span style={{ color: colors.accent }}>.</span>
        <span>log</span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: 20,
          fontFamily: 'Serif',
          fontSize: 64,
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {titleWords.map((word, i) => (
          <span key={`${word}-${i}`}>{word}</span>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'Mono',
          fontSize: 23,
          color: colors.dim,
          borderTop: `2px solid ${colors.rule}`,
          paddingTop: 24,
        }}
      >
        <span>{metaParts.join(' · ')}</span>
        <span>{new URL(site.url).host}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Serif', data: serifSemibold, weight: 600, style: 'normal' },
        { name: 'Mono', data: monoRegular, weight: 400, style: 'normal' },
      ],
    }
  )
}
