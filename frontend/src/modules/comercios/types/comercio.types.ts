export type CategoriaResumo = {
  id: string;
  nome: string;
  slug: string;
};

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

export type ComercioPublico = {
  id: string;
  slug: string;
  nome: string;
  categoria: CategoriaResumo;
  area: string;
  descrição?: string;
  serviços?: string[];
  horários?: string[];
  endereço?: string;
  telefone?: string;
  whatsapp?: string;
  redesSociais?: Array<{ label: string; url: string }>;
  siteExterno?: string;
  imagens?: MidiaPublica[];
  video?: MidiaPublica;
  possuiPagina: boolean;
  patrocinado: boolean;
  demonstracao: boolean;
  status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";
  criadoEm: string;
  alteradoEm: string;
};

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

export type StatusPublicação = "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";

export type ComercioAdmin = {
  id: string;
  slug: string;
  nome: string;
  categoria: CategoriaResumo;
  area: string;
  descrição?: string;
  serviços?: string[];
  horários?: string[];
  endereço?: string;
  telefone?: string;
  whatsapp?: string;
  siteExterno?: string;
  imagens?: MidiaAdmin[];
  video?: MidiaAdmin;
  possuiPagina: boolean;
  patrocinado: boolean;
  demonstracao: boolean;
  status: StatusPublicação;
  criadoEm: string;
  alteradoEm: string;
};

export type ImagemComercioPayload = {
  url: string;
  textoAlternativo?: string;
  credito?: string;
  origem?: string;
  tamanhoBytes?: number;
  ordem?: number;
};

export type VídeoComercioPayload = {
  url: string;
  titulo?: string;
  origem?: string;
};

export type SalvarComercioPayload = {
  nome: string;
  categoriaSlug: string;
  area: string;
  descrição?: string;
  serviços?: string[];
  horários?: string[];
  endereço?: string;
  telefone?: string;
  whatsapp?: string;
  siteExterno?: string;
  imagens?: ImagemComercioPayload[];
  video?: VídeoComercioPayload | null;
  possuiPagina: boolean;
  patrocinado: boolean;
  demonstracao: boolean;
  status: StatusPublicação;
};

export type FormImagem = {
  url: string;
  textoAlternativo: string;
  credito: string;
  origem: string;
  tamanhoBytes: string;
};

export type FormState = {
  nome: string;
  categoriaSlug: string;
  area: string;
  descrição: string;
  serviços: string;
  horários: string;
  endereço: string;
  telefone: string;
  whatsapp: string;
  siteExterno: string;
  status: StatusPublicação;
  possuiPagina: boolean;
  patrocinado: boolean;
  demonstracao: boolean;
  imagens: FormImagem[];
  videoUrl: string;
  videoTitulo: string;
  videoOrigem: string;
};

