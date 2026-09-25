type CategoriaResumo = {
  id: string;
  nome: string;
  slug: string;
};

export type StatusPublicação = "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";

export type MidiaEvento = {
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

export type EventoPublico = {
  id: string;
  titulo: string;
  categoria: CategoriaResumo;
  data: string;
  horario?: string;
  local: string;
  organizador: string;
  entrada: string;
  descricao: string;
  contato?: string;
  fonte?: string;
  imagens?: MidiaEvento[];
  video?: MidiaEvento;
  demonstracao: boolean;
  status: StatusPublicação;
  encerrado: boolean;
  criadoEm: string;
  alteradoEm: string;
};

export type EventoAdmin = {
  id: string;
  titulo: string;
  categoria: CategoriaResumo;
  data: string;
  horario?: string;
  local: string;
  organizador: string;
  entrada: string;
  descricao: string;
  contato?: string;
  fonte?: string;
  imagens?: MidiaEvento[];
  video?: MidiaEvento;
  demonstracao: boolean;
  status: StatusPublicação;
  encerrado: boolean;
  criadoEm: string;
  alteradoEm: string;
};

export type SalvarEventoPayload = {
  titulo: string;
  categoriaSlug: string;
  data: string;
  horario?: string;
  local: string;
  organizador: string;
  descricao: string;
  entrada: string;
  contato?: string;
  fonte?: string;
  imagens?: ImagemEventoPayload[];
  video?: VídeoEventoPayload | null;
  demonstracao: boolean;
  status: StatusPublicação;
};

export type ImagemEventoPayload = {
  url: string;
  textoAlternativo?: string;
  credito?: string;
  origem?: string;
  tamanhoBytes?: number;
  ordem?: number;
};

export type VídeoEventoPayload = {
  url: string;
  titulo?: string;
  origem?: string;
};
