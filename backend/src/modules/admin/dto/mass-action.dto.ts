import { z } from "zod";

export const MassDeleteSchema = z.object({
  entidade: z.enum([
    "NOTICIA",
    "COMERCIO",
    "EVENTO",
    "CURSO",
    "COMENTARIO",
    "CONTATO",
    "PEDIDO_ANUNCIO",
  ]),
  ids: z.array(z.string().min(1)).min(1).max(100),
});

export const MassUpdateSchema = z.object({
  entidade: z.enum([
    "NOTICIA",
    "COMERCIO",
    "EVENTO",
    "CURSO",
    "COMENTARIO",
    "CONTATO",
    "PEDIDO_ANUNCIO",
  ]),
  ids: z.array(z.string().min(1)).min(1).max(100),
  status: z.string().min(1),
});
