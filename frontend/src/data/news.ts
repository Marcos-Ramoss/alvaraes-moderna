export type NewsCategory =
  | "Novidades"
  | "Política e vida pública"
  | "Cultura"
  | "Comunidade";

export const newsCategories: NewsCategory[] = [
  "Novidades",
  "Política e vida pública",
  "Cultura",
  "Comunidade",
];

export type NewsArticle = {
  slug: string;
  title: string;
  summary: string;
  category: NewsCategory;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  imageCredit?: string;
  imageAlt?: string;
  featured?: boolean;
  kind?: "opiniao" | "patrocinado";
  body: string[];
  sources?: string[];
  isDemo: boolean;
};

export const news: NewsArticle[] = [
  {
    slug: "demonstracao-obras-na-orla",
    title: "Demonstração: mutirão de limpeza reúne moradores na orla",
    summary:
      "Exemplo de matéria para avaliar o layout de notícia em destaque, com resumo curto e imagem editorial.",
    category: "Comunidade",
    author: "Redação Alvarães Moderna",
    publishedAt: "2026-09-02",
    updatedAt: "2026-09-03",
    imageAlt: "Espaço reservado para fotografia local de Alvarães",
    imageCredit: "Espaço reservado — foto local ainda não fornecida",
    featured: true,
    isDemo: true,
    body: [
      "Este texto é um exemplo fictício, criado apenas para avaliar a apresentação das páginas do portal. Nenhuma informação aqui descreve fatos reais.",
      "No lugar deste conteúdo entrarão matérias produzidas pela equipe do Alvarães Moderna, com apuração, fontes identificadas e fotografias autorizadas.",
      "O corpo do texto foi pensado para leitura confortável no celular: linhas curtas, bom contraste e espaçamento generoso entre parágrafos.",
    ],
    sources: ["Conteúdo fictício — sem fonte real"],
  },
  {
    slug: "demonstracao-festival-cultural",
    title: "Demonstração: festival cultural movimenta o centro da cidade",
    summary:
      "Exemplo de matéria da editoria de Cultura, usado para testar a listagem e as páginas relacionadas.",
    category: "Cultura",
    author: "Redação Alvarães Moderna",
    publishedAt: "2026-08-28",
    imageAlt: "Espaço reservado para fotografia local de Alvarães",
    imageCredit: "Espaço reservado — foto local ainda não fornecida",
    isDemo: true,
    body: [
      "Conteúdo fictício de demonstração. Serve apenas para mostrar como uma matéria de cultura aparece no portal.",
      "Aqui entrariam a descrição do evento, depoimentos reais e o registro fotográfico feito na cidade.",
    ],
    sources: ["Conteúdo fictício — sem fonte real"],
  },
  {
    slug: "demonstracao-sessao-camara",
    title: "Demonstração: sessão discute o orçamento do município",
    summary:
      "Exemplo da editoria de Política e vida pública, com espaço para fontes identificadas e explicação de efeitos.",
    category: "Política e vida pública",
    author: "Redação Alvarães Moderna",
    publishedAt: "2026-08-20",
    imageAlt: "Espaço reservado para fotografia local de Alvarães",
    isDemo: true,
    body: [
      "Texto fictício de demonstração. Não descreve decisões, votos ou declarações reais de qualquer autoridade.",
      "Em uma matéria real, esta seção traria os documentos consultados e a explicação sobre o efeito prático da decisão na vida da população.",
    ],
    sources: ["Conteúdo fictício — sem fonte real"],
  },
  {
    slug: "demonstracao-novo-horario-do-transporte",
    title: "Demonstração: novo horário de transporte fluvial é divulgado",
    summary:
      "Exemplo da editoria Novidades, usado para verificar a listagem com vários cartões.",
    category: "Novidades",
    author: "Redação Alvarães Moderna",
    publishedAt: "2026-08-15",
    imageAlt: "Espaço reservado para fotografia local de Alvarães",
    isDemo: true,
    body: [
      "Conteúdo fictício de demonstração, criado somente para avaliação visual do portal.",
    ],
    sources: ["Conteúdo fictício — sem fonte real"],
  },
  {
    slug: "demonstracao-oficina-de-artesanato",
    title: "Demonstração: oficina de artesanato abre inscrições",
    summary:
      "Exemplo de publicação de comunidade ligada a cursos e oportunidades.",
    category: "Comunidade",
    author: "Redação Alvarães Moderna",
    publishedAt: "2026-08-10",
    imageAlt: "Espaço reservado para fotografia local de Alvarães",
    isDemo: true,
    body: ["Conteúdo fictício de demonstração."],
    sources: ["Conteúdo fictício — sem fonte real"],
  },
  {
    slug: "demonstracao-memoria-do-porto",
    title: "Demonstração: memórias do porto contadas por quem viveu ali",
    summary:
      "Exemplo de reportagem de histórias e cultura local, para testar o bloco “Nossa gente, nossas histórias”.",
    category: "Cultura",
    author: "Redação Alvarães Moderna",
    publishedAt: "2026-08-04",
    imageAlt: "Espaço reservado para fotografia local de Alvarães",
    isDemo: true,
    body: ["Conteúdo fictício de demonstração."],
    sources: ["Conteúdo fictício — sem fonte real"],
  },
];

export function getArticle(slug: string) {
  return news.find((n) => n.slug === slug);
}

export function relatedArticles(article: NewsArticle, limit = 3) {
  return news
    .filter((n) => n.slug !== article.slug)
    .sort((a, b) => (a.category === article.category ? -1 : 1))
    .slice(0, limit);
}

export function formatDate(value: string) {
  const parts = value.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
