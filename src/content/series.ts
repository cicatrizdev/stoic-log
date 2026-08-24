import type { SeriesDef } from '@/content/types'

/**
 * The series ("trilhas") registry: the prose lives here, membership and order
 * live in each post's frontmatter (`series` + `seriesOrder`). A post pointing
 * at an unregistered series fails the build.
 */
export const series = {
  'dichotomy-of-control': {
    title: {
      en: 'The Dichotomy of Control',
      pt: 'Dicotomia do Controle',
    },
    description: {
      en: 'What actually depends on you in software work — and the peace of ignoring the rest. Roadmaps, layoffs and outages are not on the list; your craft, judgment and response are.',
      pt: 'O que de fato depende de você no trabalho com software — e a paz de ignorar o resto. Roadmap, layoff e incidente não estão na lista; seu ofício, julgamento e resposta estão.',
    },
  },
  'premeditatio-malorum': {
    title: {
      en: 'Premeditatio Malorum',
      pt: 'Premeditatio Malorum',
    },
    description: {
      en: 'The Stoic exercise of rehearsing failure — as engineering practice, not anxiety: post-mortems, chaos engineering and productive pessimism.',
      pt: 'O exercício estoico de ensaiar a falha — como prática de engenharia, não ansiedade: post-mortems, chaos engineering e pessimismo produtivo.',
    },
  },
  'memento-mori': {
    title: {
      en: 'Memento Mori',
      pt: 'Memento Mori',
    },
    description: {
      en: 'Everything you ship will be deleted. On legacy, rewrites, deprecation and the art of writing code you are ready to let go of.',
      pt: 'Tudo que você entrega será deletado. Sobre legado, reescritas, deprecation e a arte de escrever código do qual você está pronto para se despedir.',
    },
  },
  askesis: {
    title: {
      en: 'Askesis — Discipline & Practice',
      pt: 'Askesis — Disciplina e Prática',
    },
    description: {
      en: 'The Stoic training regimen applied to the craft: journaling for developers, deliberate practice, consistency over motivation, learning without drowning in hype.',
      pt: 'O regime de treino estoico aplicado ao ofício: journaling para devs, prática deliberada, consistência acima de motivação, aprender sem se afogar em hype.',
    },
  },
} as const satisfies Record<string, SeriesDef>

export type SeriesSlug = keyof typeof series

export function isSeriesSlug(value: string): value is SeriesSlug {
  return value in series
}

export const seriesSlugs = Object.keys(series) as SeriesSlug[]
