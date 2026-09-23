import type { OportunidadeResumoResponseDto } from "./oportunidade-resumo.response.dto.js";

export type OportunidadeDetalheResponseDto = OportunidadeResumoResponseDto & {
  requisitos?: string;
};
