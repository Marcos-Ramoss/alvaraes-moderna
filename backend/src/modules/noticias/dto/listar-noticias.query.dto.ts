import { z } from "zod";

export const listarNoticiasQueryDto = z.object({
  busca: z.string().trim().optional(),
  categoria: z.string().trim().optional(),
  destaque: z.preprocess((valor) => valor === "true" ? true : valor === "false" ? false : valor, z.boolean()).optional(),
  ordenacao: z.enum(["MAIS_RECENTES", "MAIS_ANTIGAS", "MAIS_LIDAS"]).default("MAIS_RECENTES"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(2000).default(10),
});

export const listarNoticiasAdminQueryDto = listarNoticiasQueryDto.extend({
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).optional(),
  dataInicio: z.string().trim().optional(),
  dataFim: z.string().trim().optional(),
});

export type ListarNoticiasQueryDto = z.infer<typeof listarNoticiasQueryDto>;
export type ListarNoticiasAdminQueryDto = z.infer<typeof listarNoticiasAdminQueryDto>;
