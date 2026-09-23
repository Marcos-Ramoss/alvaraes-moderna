import { z } from "zod";
import { imagemRequestDto, videoLinkRequestDto } from "../../midias/dto/midia.request.dto.js";

const textoOpcional = (max: number) => z.string().trim().max(max).optional();

export const redeSocialDto = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().url().max(500),
});

export const criarComercioRequestDto = z.object({
  nome: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(3).max(180).optional(),
  categoriaId: z.string().trim().min(1).optional(),
  categoriaSlug: z.string().trim().min(1).optional(),
  area: z.string().trim().min(2).max(120),
  descricao: textoOpcional(5000),
  servicos: z.array(z.string().trim().min(1).max(120)).optional(),
  horarios: z.array(z.string().trim().min(1).max(120)).optional(),
  endereco: textoOpcional(250),
  telefone: textoOpcional(40),
  whatsapp: textoOpcional(40),
  redesSociais: z.array(redeSocialDto).optional(),
  siteExterno: z.string().trim().url().max(500).optional(),
  imagens: z.array(imagemRequestDto).max(5).optional(),
  video: videoLinkRequestDto.nullable().optional(),
  possuiPagina: z.boolean().default(false),
  patrocinado: z.boolean().default(false),
  demonstracao: z.boolean().default(false),
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).default("RASCUNHO"),
});

export type CriarComercioRequestDto = z.infer<typeof criarComercioRequestDto>;
