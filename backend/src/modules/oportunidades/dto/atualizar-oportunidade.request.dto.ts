import { z } from "zod";
import { criarOportunidadeRequestDto } from "./criar-oportunidade.request.dto.js";

export const atualizarOportunidadeRequestDto = criarOportunidadeRequestDto.partial();

export type AtualizarOportunidadeRequestDto = z.infer<typeof atualizarOportunidadeRequestDto>;
