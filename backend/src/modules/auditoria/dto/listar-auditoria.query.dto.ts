import { z } from "zod";

export const listarAuditoriaQueryDto = z.object({
  busca: z.string().trim().optional(),
  usuarioId: z.string().trim().optional(),
  acao: z.enum(["CRIAR", "ATUALIZAR", "EXCLUIR", "PUBLICAR", "STATUS", "LOGIN"]).optional(),
  recurso: z.enum([
    "NOTICIA",
    "COMERCIO",
    "EVENTO",
    "CURSO",
    "COMENTARIO",
    "CONTATO",
    "PEDIDO_ANUNCIO",
    "USUARIO",
    "SISTEMA",
  ]).optional(),
  dataInicio: z.string().trim().optional(),
  dataFim: z.string().trim().optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(30),
});

export type ListarAuditoriaQueryDto = z.infer<typeof listarAuditoriaQueryDto>;
