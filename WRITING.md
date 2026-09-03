# stoic.log(1) — manual do editor

Como escrever, testar, publicar e "agendar" posts. O fluxo inteiro é git: não há CMS, painel nem banco — um post é um par de arquivos MDX, e publicar é um push.

## Anatomia de um post

```
content/posts/<slug>/
├── pt.mdx   # versão em português
└── en.mdx   # versão em inglês
```

- O **nome do diretório é o slug** e a URL nas duas línguas (`/pt/posts/<slug>`, `/en/posts/<slug>`). Use kebab-case em inglês, curto e permanente — mudar slug depois quebra links.
- Pode existir só uma língua: a outra renderiza a original com aviso de tradução e canonical correto. Publique de preferência com o par completo.

### Frontmatter (validado por zod — erro quebra o build, de propósito)

```yaml
---
title: 'Todo código morre'
description: 'Até 160 caracteres; vira a meta description e o texto dos cards.'
date: '2026-08-25' # data de publicação (ordena as listagens; num draft, é a data AGENDADA)
updated: '2026-09-01' # opcional; nunca anterior a date
tags: ['stoicism', 'legacy-code'] # slugs registrados em src/content/tags.ts
series: 'memento-mori' # opcional; registrada em src/content/series.ts
seriesOrder: 1 # obrigatório se series existir (posição na trilha)
draft: true # opcional; oculto SÓ em produção (visível em dev/preview)
---
```

As duas línguas devem concordar em `series`/`seriesOrder` (o build confere). Tag ou série não registrada = build falha com mensagem dizendo onde registrar.

## Escrever

Componentes disponíveis dentro do MDX (o conjunto é fixo — sem imports arbitrários):

```mdx
<Epigraph source="Marco Aurélio, Meditações, 4.43">
  A citação clássica que abre o ensaio.
</Epigraph>

<Callout label="na prática">O exercício aplicável do ensaio.</Callout>
```

Markdown completo funciona: títulos `##`/`###` (ganham âncora automática), código com syntax highlight (tema claro/escuro automático), tabelas, listas, `---` vira o separador `· · ·`.

**Imagens**: coloque em `public/posts/<slug>/` e referencie `![alt](/posts/<slug>/figura.png)`.

**Guia de voz** (calibrado em 2026-08-24; os ensaios publicados são a referência):

- Sóbrio na filosofia, ácido na indústria — a acidez mira rituais, hype e cultura (o herói do hotfix, o blameless de fachada), nunca pessoas.
- Autoironia bem-vinda; crueldade não.
- Abre com Epigraph clássica; um Callout "na prática" por ensaio; referências dev concretas.
- Final seco, sem acidez — o contraste é o efeito.

## Testar

```bash
npm run dev     # localhost:3000 — drafts aparecem
npm run check   # lint + typecheck + prettier
npm run build   # gate de conteúdo: frontmatter, tags, séries, pares
```

## Publicar

**Cadência: quinzenal, aos domingos.**

### Agendado (o padrão)

Publicar é datar: um ensaio pronto fica com `draft: true` e `date` marcando o **domingo em que deve sair**. Todo dia às ~09:00 (BRT) o workflow `publish` (`.github/workflows/publish.yml`) roda `scripts/publish-due.mjs`: drafts cuja `date` chegou perdem a flag nos dois arquivos, o commit vai pra main e a Vercel deploya. Se o cron falhar num dia, o próximo run publica o atrasado (catch-up).

Testar o que sairia numa data: `PUBLISH_TODAY=2026-09-21 node scripts/publish-due.mjs --dry-run`. Disparar manualmente: aba Actions → publish → Run workflow.

### Manual (furar a fila)

1. Remova `draft: true` **dos dois arquivos** e ajuste `date` para hoje.
2. `git commit` + `git push origin main` → a Vercel deploya (~1 min).
3. Confira em https://log.cicatriz.dev — RSS, sitemap, busca e OG image atualizam sozinhos no build.

### Fila atual (2026-09-03)

| ordem | slug                        | trilha               | agendado p/ |
| ----- | --------------------------- | -------------------- | ----------- |
| ✔ ar  | you-dont-control-the-deploy | dichotomy-of-control | 25/08       |
| 1     | hype-is-not-your-business   | askesis              | dom 07/09   |
| 2     | postmortem-premeditatio     | premeditatio-malorum | dom 21/09   |
| 3     | all-code-dies               | memento-mori         | dom 05/10   |

Para manter a fila viva na cadência quinzenal, basta terminar ~1 ensaio a cada 2 semanas.

## Newsletter da edição

Envio é manual, no dashboard do Resend (Broadcasts):

1. resend.com → Broadcasts → New → audience **stoic.log pt** (e outra edição para **en**).
2. Escreva a chamada do ensaio + link. Inclua `{{{RESEND_UNSUBSCRIBE_URL}}}` no rodapé (o editor oferece; é obrigatório).
3. Send. Quem se descadastra é filtrado automaticamente nos próximos envios.

## Manutenção rápida

- **Nova tag/trilha**: registre em `src/content/tags.ts` / `src/content/series.ts` (label/título nas duas línguas).
- **Trilha sonora do header**: `src/content/site.ts` → `soundtrack.url` (YouTube = com volume; Spotify = embed simples).
- **Textos de interface**: `src/content/ui/pt.ts` + `en.ts` — o TypeScript obriga as duas línguas.
- **Corrigir post publicado**: edite, preencha `updated`, push.
