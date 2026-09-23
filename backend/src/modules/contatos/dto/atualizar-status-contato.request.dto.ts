import { z } from "zod";

export const atualizarStatusContatoRequestDto = z.object({
  status: z.enum(["NOVO", "EM_ANALISE", "RESPONDIDO", "ARQUIVADO"]),
});

export type AtualizarStatusContatoRequestDto = z.infer<typeof atualizarStatusContatoRequestDto>;
