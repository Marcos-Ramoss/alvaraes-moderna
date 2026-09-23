export type RedeSocialResponseDto = {
  label: string;
  url: string;
};

import type { MidiaResponseDto } from "../../midias/dto/midia.response.dto.js";

export type ComercioResumoResponseDto = {
  id: string;
  slug: string;
  nome: string;
  categoria: {
    id: string;
    nome: string;
    slug: string;
  };
  area: string;
  telefone?: string | undefined;
  whatsapp?: string | undefined;
  siteExterno?: string | undefined;
  imagens?: MidiaResponseDto[] | undefined;
  video?: MidiaResponseDto | undefined;
  possuiPagina: boolean;
  patrocinado: boolean;
  demonstracao: boolean;
  status: string;
  criadoEm: string;
  alteradoEm: string;
};
