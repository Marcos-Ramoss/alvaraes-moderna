import { z } from "zod";

export const TAMANHO_MAXIMO_IMAGEM_BYTES = 2 * 1024 * 1024;

// TODO: quando houver upload real, receber arquivo, converter para WebP e salvar apenas a URL final.
const urlHttpOuHttpsDto = z
  .string()
  .trim()
  .url()
  .max(500)
  .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
    message: "Informe uma URL http ou https.",
  });

export const imagemRequestDto = z.object({
  url: urlHttpOuHttpsDto,
  textoAlternativo: z.string().trim().max(250).optional(),
  credito: z.string().trim().max(250).optional(),
  origem: z.string().trim().max(250).optional(),
  tamanhoBytes: z.number().int().positive().max(TAMANHO_MAXIMO_IMAGEM_BYTES).optional(),
  ordem: z.number().int().min(0).max(99).optional(),
});

export const videoLinkRequestDto = z.object({
  url: urlHttpOuHttpsDto,
  titulo: z.string().trim().max(180).optional(),
  origem: z.string().trim().max(250).default("LINK_EXTERNO"),
});

export type ImagemRequestDto = z.infer<typeof imagemRequestDto>;
export type VideoLinkRequestDto = z.infer<typeof videoLinkRequestDto>;
