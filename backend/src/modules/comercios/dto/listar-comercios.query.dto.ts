import { z } from "zod";

export const listarComerciosQueryDto = z.object({
  busca: z.string().trim().optional(),
  categoria: z.string().trim().optional(),
  patrocinado: z.coerce.boolean().optional(),
  possuiPagina: z.coerce.boolean().optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(2000).default(10),
});

export const listarComerciosAdminQueryDto = listarComerciosQueryDto.extend({
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).optional(),
});

export type ListarComerciosQueryDto = z.infer<typeof listarComerciosQueryDto>;
export type ListarComerciosAdminQueryDto = z.infer<typeof listarComerciosAdminQueryDto>;
