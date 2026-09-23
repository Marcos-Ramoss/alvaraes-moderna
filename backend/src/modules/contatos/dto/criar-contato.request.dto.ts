import { z } from "zod";

export const criarContatoRequestDto = z.object({
  tipo: z.enum(["SUGESTAO_PAUTA", "CORRECAO", "MENSAGEM_GERAL"]).default("MENSAGEM_GERAL"),
  nome: z.string().trim().min(2).max(120),
  contatoResposta: z.string().trim().min(5).max(180),
  assunto: z.string().trim().max(160).optional(),
  mensagem: z.string().trim().min(10).max(3000),
});

export type CriarContatoRequestDto = z.infer<typeof criarContatoRequestDto>;
