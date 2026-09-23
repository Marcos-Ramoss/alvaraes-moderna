import { z } from "zod";
import { imagemRequestDto, videoLinkRequestDto } from "../../midias/dto/midia.request.dto.js";

const textoOpcional = (max: number) => z.string().trim().max(max).optional();

export const criarEventoRequestDto = z.object({
  titulo: z.string().trim().min(3).max(180),
  categoriaId: z.string().trim().min(1).optional(),
  categoriaSlug: z.string().trim().min(1).optional(),
  data: z.string().trim().datetime(),
  horario: textoOpcional(80),
  local: z.string().trim().min(2).max(180),
  organizador: z.string().trim().min(2).max(180),
  descricao: z.string().trim().min(10).max(5000),
  entrada: z.string().trim().min(2).max(180),
  contato: textoOpcional(180),
  fonte: textoOpcional(250),
  imagens: z.array(imagemRequestDto).max(5).optional(),
  video: videoLinkRequestDto.nullable().optional(),
  demonstracao: z.boolean().default(false),
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).default("RASCUNHO"),
});

export type CriarEventoRequestDto = z.infer<typeof criarEventoRequestDto>;
