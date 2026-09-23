import { z } from "zod";

export const criarPedidoAnuncioRequestDto = z.object({
  tipo: z
    .enum(["CADASTRO_BASICO", "PAGINA_COMPLETA", "DESTAQUE_PATROCINADO"])
    .default("CADASTRO_BASICO"),
  nomeResponsavel: z.string().trim().min(2).max(120),
  contatoResponsavel: z.string().trim().min(5).max(180),
  nomeComercio: z.string().trim().min(2).max(160),
  categoriaPretendida: z.string().trim().max(120).optional(),
  localizacaoResumida: z.string().trim().max(160).optional(),
  mensagem: z.string().trim().max(3000).optional(),
});

export type CriarPedidoAnuncioRequestDto = z.infer<typeof criarPedidoAnuncioRequestDto>;
