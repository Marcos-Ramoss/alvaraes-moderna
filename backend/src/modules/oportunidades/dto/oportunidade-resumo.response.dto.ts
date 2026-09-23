import type { ModalidadeOportunidade, StatusPublicacao } from "@prisma/client";
import type { MidiaResponseDto } from "../../midias/dto/midia.response.dto.js";

export type OportunidadeResumoResponseDto = {
  id: string;
  titulo: string;
  organizador: string;
  modalidade: ModalidadeOportunidade;
  local?: string;
  prazo: string;
  custo?: string;
  linkInscricao?: string;
  imagens?: MidiaResponseDto[] | undefined;
  video?: MidiaResponseDto | undefined;
  demonstracao: boolean;
  status: StatusPublicacao;
  encerrada: boolean;
  criadoEm: string;
  alteradoEm: string;
};
