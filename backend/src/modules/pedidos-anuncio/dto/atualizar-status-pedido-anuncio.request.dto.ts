import { z } from "zod";

export const atualizarStatusPedidoAnuncioRequestDto = z.object({
  status: z.enum(["NOVO", "EM_CONTATO", "CONVERTIDO", "ARQUIVADO"]),
});

export type AtualizarStatusPedidoAnuncioRequestDto = z.infer<
  typeof atualizarStatusPedidoAnuncioRequestDto
>;
