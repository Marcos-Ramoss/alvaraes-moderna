import type { StatusPublicacao } from "@prisma/client";
import type { MidiaResponseDto } from "../../midias/dto/midia.response.dto.js";

export type EventoCategoriaResponseDto = {
  id: string;
  nome: string;
  slug: string;
};

export type EventoResumoResponseDto = {
  id: string;
  titulo: string;
  categoria: EventoCategoriaResponseDto;
  data: string;
  horario?: string;
  local: string;
  organizador: string;
  entrada: string;
  imagens?: MidiaResponseDto[] | undefined;
  video?: MidiaResponseDto | undefined;
  demonstracao: boolean;
  status: StatusPublicacao;
  encerrado: boolean;
  criadoEm: string;
  alteradoEm: string;
};
