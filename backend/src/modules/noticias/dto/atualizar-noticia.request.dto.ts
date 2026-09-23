import { criarNoticiaRequestDto } from "./criar-noticia.request.dto.js";
import type { z } from "zod";

export const atualizarNoticiaRequestDto = criarNoticiaRequestDto.partial().refine(
  (dados) => Object.keys(dados).length > 0,
  "Informe ao menos um campo para atualizar.",
);

export type AtualizarNoticiaRequestDto = z.infer<typeof atualizarNoticiaRequestDto>;
