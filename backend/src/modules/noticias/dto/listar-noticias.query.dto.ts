import { z } from "zod";

export const listarNoticiasQueryDto = z.object({
  busca: z.string().trim().optional(),
  categoria: z.string().trim().optional(),
  destaque: z.coerce.boolean().optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(2000).default(10),
});

export const listarNoticiasAdminQueryDto = listarNoticiasQueryDto.extend({
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).optional(),
});

export type ListarNoticiasQueryDto = z.infer<typeof listarNoticiasQueryDto>;
export type ListarNoticiasAdminQueryDto = z.infer<typeof listarNoticiasAdminQueryDto>;
