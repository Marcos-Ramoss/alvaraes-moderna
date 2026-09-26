import { z } from "zod";

export const listarComerciosQueryDto = z.object({
  busca: z.string().trim().optional(),
  categoria: z.string().trim().optional(),
  patrocinado: z.preprocess((valor) => valor === "true" ? true : valor === "false" ? false : valor, z.boolean()).optional(),
  possuiPagina: z.preprocess((valor) => valor === "true" ? true : valor === "false" ? false : valor, z.boolean()).optional(),
  ordenacao: z.enum(["MAIS_RECENTES", "NOME"]).default("MAIS_RECENTES"),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(2000).default(10),
});

export const listarComerciosAdminQueryDto = listarComerciosQueryDto.extend({
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).optional(),
  dataInicio: z.string().trim().optional(),
  dataFim: z.string().trim().optional(),
});

export type ListarComerciosQueryDto = z.infer<typeof listarComerciosQueryDto>;
export type ListarComerciosAdminQueryDto = z.infer<typeof listarComerciosAdminQueryDto>;
