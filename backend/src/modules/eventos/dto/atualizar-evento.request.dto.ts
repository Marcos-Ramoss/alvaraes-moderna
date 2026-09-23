import { z } from "zod";
import { criarEventoRequestDto } from "./criar-evento.request.dto.js";

export const atualizarEventoRequestDto = criarEventoRequestDto.partial();

export type AtualizarEventoRequestDto = z.infer<typeof atualizarEventoRequestDto>;
