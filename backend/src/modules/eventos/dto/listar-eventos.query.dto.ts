import { z } from "zod";

const paginaDto = z.coerce.number().int().positive().default(1);
const limiteDto = z.coerce.number().int().positive().max(2000).default(20);

export const listarEventosQueryDto = z.object({
  busca: z.string().trim().min(1).max(120).optional(),
  categoria: z.string().trim().min(1).max(140).optional(),
  situacao: z.enum(["FUTURO", "ENCERRADO", "TODOS"]).default("TODOS"),
  pagina: paginaDto,
  limite: limiteDto,
});

export const listarEventosAdminQueryDto = listarEventosQueryDto.extend({
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).optional(),
});

export type ListarEventosQueryDto = z.infer<typeof listarEventosQueryDto>;
export type ListarEventosAdminQueryDto = z.infer<typeof listarEventosAdminQueryDto>;
