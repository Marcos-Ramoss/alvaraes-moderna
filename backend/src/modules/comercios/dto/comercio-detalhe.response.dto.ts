import type {
  ComercioResumoResponseDto,
  RedeSocialResponseDto,
} from "./comercio-resumo.response.dto.js";

export type ComercioDetalheResponseDto = ComercioResumoResponseDto & {
  descricao?: string | undefined;
  servicos: string[];
  horarios: string[];
  endereco?: string | undefined;
  redesSociais: RedeSocialResponseDto[];
};
