import type { z } from "zod";
import { criarComercioRequestDto } from "./criar-comercio.request.dto.js";

export const atualizarComercioRequestDto = criarComercioRequestDto.partial().refine(
  (dados) => Object.keys(dados).length > 0,
  "Informe ao menos um campo para atualizar.",
);

export type AtualizarComercioRequestDto = z.infer<typeof atualizarComercioRequestDto>;
