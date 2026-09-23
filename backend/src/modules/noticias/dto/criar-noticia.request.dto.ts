import { z } from "zod";
import { imagemRequestDto, videoLinkRequestDto } from "../../midias/dto/midia.request.dto.js";

export const criarNoticiaRequestDto = z.object({
  titulo: z.string().trim().min(5).max(180),
  slug: z.string().trim().min(3).max(180).optional(),
  resumo: z.string().trim().min(10).max(300),
  corpo: z.array(z.string().trim().min(1)).min(1),
  fontes: z.array(z.string().trim().min(1)).optional(),
  autorNome: z.string().trim().min(2).max(120),
  categoriaId: z.string().trim().min(1).optional(),
  categoriaSlug: z.string().trim().min(1).optional(),
  tipoConteudo: z.enum(["NOTICIA", "OPINIAO", "PATROCINADO"]).default("NOTICIA"),
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).default("RASCUNHO"),
  destaque: z.boolean().default(false),
  demonstracao: z.boolean().default(false),
  imagemUrl: z.string().trim().url().max(500).optional(),
  imagemAlt: z.string().trim().max(250).optional(),
  imagemCredito: z.string().trim().max(250).optional(),
  imagens: z.array(imagemRequestDto).max(5).optional(),
  video: videoLinkRequestDto.nullable().optional(),
});

export type CriarNoticiaRequestDto = z.infer<typeof criarNoticiaRequestDto>;
