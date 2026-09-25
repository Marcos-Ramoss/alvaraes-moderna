import type { MidiaResponseDto } from "../../midias/dto/midia.response.dto.js";

export type NoticiaResumoResponseDto = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  totalLeituras: number;
  categoria: {
    id: string;
    nome: string;
    slug: string;
  };
  autorNome: string;
  tipoConteudo: string;
  status: string;
  destaque: boolean;
  demonstracao: boolean;
  imagemUrl?: string | undefined;
  imagemAlt?: string | undefined;
  imagemCredito?: string | undefined;
  imagens?: MidiaResponseDto[] | undefined;
  video?: MidiaResponseDto | undefined;
  publicadoEm?: string | undefined;
  criadoEm: string;
  alteradoEm: string;
};
