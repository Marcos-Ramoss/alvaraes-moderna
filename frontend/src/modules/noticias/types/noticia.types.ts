export type MidiaPublica = {
  id: string;
  tipoMidia: "IMAGEM" | "VIDEO";
  url: string;
  titulo?: string;
  textoAlternativo?: string;
  credito?: string;
  origem?: string;
  tamanhoBytes?: number;
  duracaoSegundos?: number;
  ordem: number;
};

export type NoticiaPublica = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  categoria: {
    id: string;
    nome: string;
    slug: string;
  };
  autorNome: string;
  tipoConteudo: "NOTICIA" | "OPINIAO" | "PATROCINADO";
  status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";
  destaque: boolean;
  demonstracao: boolean;
  imagemUrl?: string;
  imagemAlt?: string;
  imagemCredito?: string;
  imagens?: MidiaPublica[];
  video?: MidiaPublica;
  publicadoEm?: string;
  criadoEm: string;
  alteradoEm: string;
  corpo?: string[];
  fontes?: string[];
  totalCurtidas?: number;
  totalComentarios?: number;
};

export type NewsSearch = {
  categoria?: string;
};

// Admin Types

export type MidiaAdmin = {
  id: string;
  tipoMidia: "IMAGEM" | "VIDEO";
  url: string;
  titulo?: string;
  textoAlternativo?: string;
  credito?: string;
  origem?: string;
  tamanhoBytes?: number;
  duracaoSegundos?: number;
  ordem: number;
};

export type NoticiaAdmin = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  categoria: {
    id: string;
    nome: string;
    slug: string;
  };
  autorNome: string;
  tipoConteudo: "NOTICIA" | "OPINIAO" | "PATROCINADO";
  status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";
  destaque: boolean;
  demonstracao: boolean;
  publicadoEm?: string;
  imagemUrl?: string;
  imagemAlt?: string;
  imagemCredito?: string;
  imagens?: MidiaAdmin[];
  video?: MidiaAdmin;
  criadoEm: string;
  alteradoEm: string;
  corpo?: string[];
  fontes?: string[];
  totalCurtidas?: number;
  totalComentarios?: number;
};

export type ImagemNoticiaPayload = {
  url: string;
  textoAlternativo?: string;
  credito?: string;
  origem?: string;
  tamanhoBytes?: number;
  ordem?: number;
};

export type VídeoNoticiaPayload = {
  url: string;
  titulo?: string;
  origem?: string;
};

export type SalvarNoticiaPayload = {
  titulo: string;
  resumo: string;
  corpo: string[];
  autorNome: string;
  categoriaSlug: string;
  status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";
  tipoConteudo: "NOTICIA" | "OPINIAO" | "PATROCINADO";
  destaque: boolean;
  demonstracao: boolean;
  fontes?: string[];
  imagens?: ImagemNoticiaPayload[];
  video?: VídeoNoticiaPayload | null;
};

// Form Types

export type FormImagem = {
  url: string;
  textoAlternativo: string;
  credito: string;
  origem: string;
  tamanhoBytes: string;
};

export type FormState = {
  titulo: string;
  resumo: string;
  categoriaSlug: string;
  autorNome: string;
  corpo: string;
  fontes: string;
  status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";
  tipoConteúdo: "NOTICIA" | "OPINIAO" | "PATROCINADO";
  destaque: boolean;
  demonstracao: boolean;
  imagens: FormImagem[];
  videoUrl: string;
  videoTitulo: string;
  videoOrigem: string;
};

