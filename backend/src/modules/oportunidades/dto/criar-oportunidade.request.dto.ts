import { z } from "zod";
import { imagemRequestDto, videoLinkRequestDto } from "../../midias/dto/midia.request.dto.js";

const textoOpcional = (max: number) => z.string().trim().max(max).optional();

export const criarOportunidadeRequestDto = z.object({
  titulo: z.string().trim().min(3).max(180),
  organizador: z.string().trim().min(2).max(180),
  modalidade: z.enum(["PRESENCIAL", "ONLINE", "HIBRIDO"]),
  local: textoOpcional(180),
  prazo: z.string().trim().datetime(),
  requisitos: textoOpcional(5000),
  custo: textoOpcional(120),
  linkInscricao: z.string().trim().url().max(500).optional(),
  imagens: z.array(imagemRequestDto).max(5).optional(),
  video: videoLinkRequestDto.nullable().optional(),
  categoriaId: z.string().trim().min(1).optional(),
  categoriaSlug: z.string().trim().min(1).optional(),
  demonstracao: z.boolean().default(false),
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).default("RASCUNHO"),
});

export type CriarOportunidadeRequestDto = z.infer<typeof criarOportunidadeRequestDto>;
