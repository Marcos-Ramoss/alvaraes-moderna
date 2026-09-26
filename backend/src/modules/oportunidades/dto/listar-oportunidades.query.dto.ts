import { z } from "zod";

const paginaDto = z.coerce.number().int().positive().default(1);
const limiteDto = z.coerce.number().int().positive().max(2000).default(20);

export const listarOportunidadesQueryDto = z.object({
  busca: z.string().trim().min(1).max(120).optional(),
  modalidade: z.enum(["PRESENCIAL", "ONLINE", "HIBRIDO"]).optional(),
  situacao: z.enum(["ABERTA", "ENCERRADA", "TODAS"]).default("TODAS"),
  pagina: paginaDto,
  limite: limiteDto,
});

export const listarOportunidadesAdminQueryDto = listarOportunidadesQueryDto.extend({
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).optional(),
  dataInicio: z.string().trim().optional(),
  dataFim: z.string().trim().optional(),
});

export type ListarOportunidadesQueryDto = z.infer<typeof listarOportunidadesQueryDto>;
export type ListarOportunidadesAdminQueryDto = z.infer<typeof listarOportunidadesAdminQueryDto>;
