import type { UiStrings } from '@/content/types'

export const pt: UiStrings = {
  meta: {
    title: 'stoic.log — filosofia prática para quem constrói software',
    description:
      'Ensaios sobre estoicismo aplicado à construção de software: incidentes, carreira, código legado e a disciplina do ofício.',
  },
  chrome: {
    skipToContent: 'Pular para o conteúdo',
    themeLabel: 'Alternar tema de cores',
    themeLight: 'claro',
    themeDark: 'escuro',
    localeLabel: 'Switch to English',
  },
  nav: {
    posts: 'posts',
    series: 'trilhas',
    tags: 'tags',
    search: 'busca',
    newsletter: 'newsletter',
    ariaLabel: 'Navegação principal',
  },
  home: {
    eyebrow: '$ tail -f stoic.log',
    manifesto: [
      'Marco Aurélio escreveu suas Meditações como um diário privado — um log. Este é o meu: filosofia estoica aplicada à prática diária de construir software.',
      'Você não controla o roadmap, o mercado nem o pager. Você controla seu ofício, seu julgamento e sua resposta. Este log é sobre a segunda lista.',
    ],
    latest: 'Últimas entradas',
    allPosts: 'todos os posts',
    seriesTitle: 'Trilhas',
    allSeries: 'todas as trilhas',
  },
  post: {
    minRead: 'min de leitura',
    updated: 'atualizado',
    draft: 'rascunho',
    translationNotice:
      'Esta entrada ainda não foi traduzida — exibindo o original.',
    seriesLabel: 'trilha',
    seriesProgress: 'parte {n} de {m}',
    soundtrack: 'trilha sonora',
    soundtrackPlay: 'carregar o player (embed externo)',
    prev: 'anterior',
    next: 'próxima',
    comments: 'Comentários',
  },
  archive: {
    title: 'Todos os posts',
    empty: 'Nada por aqui ainda. A disciplina está em voltar.',
  },
  tags: {
    title: 'Tags',
    count: '{count} entradas',
  },
  series: {
    title: 'Trilhas',
    blurb:
      'Sequências ordenadas de entradas, cada uma explorando uma prática estoica aplicada a software.',
    count: '{count} partes',
  },
  search: {
    title: 'Busca',
    placeholder: 'Buscar entradas…',
    noResults: 'Nenhuma entrada encontrada para',
    hint: 'A busca roda localmente — nada sai do seu navegador.',
  },
  newsletter: {
    title: 'Newsletter',
    blurb:
      'Um ensaio a cada duas semanas, na sua caixa de entrada. Consistência acima de alcance — sem ruído, sem spam, cancele quando quiser.',
    emailLabel: 'Endereço de email',
    emailPlaceholder: 'voce@exemplo.com',
    submit: 'assinar',
    sending: 'enviando…',
    sentTitle: 'Confira sua caixa de entrada',
    sentBody:
      'Enviamos um link de confirmação. Ele expira em 24 horas — nada é enviado até você clicar.',
    confirmedTitle: 'Assinatura confirmada',
    confirmedBody:
      'Bem-vindo. A próxima entrada chega na sua caixa de entrada.',
    backHome: 'voltar ao log',
    errorInvalid: 'Esse endereço de email não parece certo.',
    errorRateLimited: 'Muitas tentativas — tente de novo em alguns minutos.',
    errorFailed: 'Não foi possível assinar agora. Tente mais tarde.',
  },
  footer: {
    rss: 'rss',
    source: 'código',
    colophon: 'um log de',
  },
  notFound: {
    title: '404 — entrada não encontrada',
    body: 'Nada vive neste caminho.',
    back: 'voltar ao log',
    flavor: '“A perda nada mais é do que mudança.” — Marco Aurélio',
  },
}
