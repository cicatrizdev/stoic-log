# stoic.log

Source of [log.cicatriz.dev](https://log.cicatriz.dev) — essays on Stoicism applied to building software, by [Pedro "Cicatriz" Mello](https://cicatriz.dev). Bilingual (pt-BR / en).

## Stack

- [Next.js](https://nextjs.org) (App Router, React 19, TypeScript) deployed on Vercel
- Hand-rolled MDX pipeline (`gray-matter` + `zod` + `@mdx-js/mdx`, compiled outside the bundler) — every post route is fully static
- CSS Modules + custom properties (`src/styles/tokens.css`) — light "marble" and dark "bronze" themes; Source Serif 4 for prose, IBM Plex Mono for chrome
- [MiniSearch](https://github.com/lucaong/minisearch) client-side search over a build-time JSON index
- [Resend](https://resend.com) newsletter with stateless HMAC double opt-in (`/api/newsletter/*`)
- [giscus](https://giscus.app) comments (GitHub Discussions), one thread per post shared across locales
- No UI kit, no CSS framework

## Writing a post

Create `content/posts/<slug>/pt.mdx` and/or `en.mdx`. The directory name is the slug for both locales; the filename is the language. Frontmatter (validated by zod — a violation fails the build):

```yaml
title: 'Todo código morre'
description: 'Up to 160 chars; doubles as the meta description.'
date: '2026-08-24'
updated: '2026-09-01' # optional
tags: ['stoicism', 'legacy-code'] # must exist in src/content/tags.ts
series: 'memento-mori' # optional; must exist in src/content/series.ts
seriesOrder: 1 # required iff series is set
draft: true # optional; hidden in production only
```

A missing translation falls back to the original with a notice; drafts are visible in dev and preview deploys. Components available inside MDX: `<Epigraph source="…">`, `<Callout label="…">`.

## Development

```bash
nvm use          # Node 22 (.nvmrc)
npm install
cp .env.example .env.local   # optional: Resend keys for a real newsletter flow
npm run dev
```

Without `RESEND_API_KEY` the newsletter logs the confirmation link instead of emailing it.

| Script          | Purpose                               |
| --------------- | ------------------------------------- |
| `npm run dev`   | local server at http://localhost:3000 |
| `npm run build` | production build + content validation |
| `npm run check` | lint + typecheck + prettier           |
