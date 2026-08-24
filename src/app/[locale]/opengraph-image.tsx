import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { isLocale, defaultLocale, locales } from '@/lib/i18n'
import { site, getUi } from '@/content'

export const alt = 'stoic.log — Stoicism × software'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
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
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : defaultLocale
  const ui = getUi(locale)
  const tagline = ui.meta.title.split('—')[1]?.trim() ?? ui.meta.title

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
          color: colors.dim,
          borderBottom: `2px solid ${colors.rule}`,
          paddingBottom: 24,
        }}
      >
        $ tail -f stoic.log
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'Serif',
            fontSize: 110,
            fontWeight: 600,
          }}
        >
          <span>stoic</span>
          <span style={{ color: colors.accent }}>.</span>
          <span>log</span>
          <div
            style={{
              width: 26,
              height: 84,
              marginLeft: 20,
              background: colors.accent,
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Serif',
            fontSize: 38,
            color: colors.dim,
            maxWidth: 900,
          }}
        >
          {tagline}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'Mono',
          fontSize: 24,
          color: colors.dim,
          borderTop: `2px solid ${colors.rule}`,
          paddingTop: 24,
        }}
      >
        <span>{new URL(site.url).host}</span>
        <span>{site.author}</span>
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
