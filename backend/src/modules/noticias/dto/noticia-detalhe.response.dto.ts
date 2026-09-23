import type { NoticiaResumoResponseDto } from "./noticia-resumo.response.dto.js";

export type NoticiaDetalheResponseDto = NoticiaResumoResponseDto & {
  corpo: string[];
  fontes: string[];
};
