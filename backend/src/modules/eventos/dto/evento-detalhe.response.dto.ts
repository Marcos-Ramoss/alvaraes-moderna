import type { EventoResumoResponseDto } from "./evento-resumo.response.dto.js";

export type EventoDetalheResponseDto = EventoResumoResponseDto & {
  descricao: string;
  contato?: string;
  fonte?: string;
};
