export type StatusPublicação = "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";

export type MidiaCurso = {
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

export type OportunidadePublica = {
  id: string;
  titulo: string;
  organizador: string;
  modalidade: "PRESENCIAL" | "ONLINE" | "HIBRIDO";
  local?: string;
  prazo: string;
  requisitos?: string;
  custo?: string;
  linkInscrição?: string;
  imagens?: MidiaCurso[];
  video?: MidiaCurso;
  demonstracao: boolean;
  status: StatusPublicação;
  encerrada: boolean;
  criadoEm: string;
  alteradoEm: string;
};

export type CursoAdmin = {
  id: string;
  titulo: string;
  organizador: string;
  modalidade: "PRESENCIAL" | "ONLINE" | "HIBRIDO";
  local?: string;
  prazo: string;
  requisitos?: string;
  custo?: string;
  linkInscrição?: string;
  imagens?: MidiaCurso[];
  video?: MidiaCurso;
  demonstracao: boolean;
  status: StatusPublicação;
  encerrada: boolean;
  criadoEm: string;
  alteradoEm: string;
};

export type SalvarCursoPayload = {
  titulo: string;
  organizador: string;
  modalidade: "PRESENCIAL" | "ONLINE" | "HIBRIDO";
  local?: string;
  prazo: string;
  requisitos?: string;
  custo?: string;
  linkInscrição?: string;
  categoriaSlug?: string;
  imagens?: ImagemCursoPayload[];
  video?: VídeoCursoPayload | null;
  demonstracao: boolean;
  status: StatusPublicação;
};

export type ImagemCursoPayload = {
  url: string;
  textoAlternativo?: string;
  credito?: string;
  origem?: string;
  tamanhoBytes?: number;
  ordem?: number;
};

export type VídeoCursoPayload = {
  url: string;
  titulo?: string;
  origem?: string;
};
