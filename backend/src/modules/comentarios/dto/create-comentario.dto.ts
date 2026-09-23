import { z } from "zod";
import { TipoEntidade } from "@prisma/client";

export const CreateComentarioSchema = z.object({
  entidadeTipo: z.nativeEnum(TipoEntidade),
  entidadeId: z.string().min(1),
  autorNome: z.string().min(2, "O nome deve ter no minimo 2 caracteres").max(120),
  autorEmail: z.string().email("E-mail invalido").max(180).optional().or(z.literal("")),
  conteudo: z.string().min(3, "O comentario deve ter no minimo 3 caracteres").max(1000),
});

export type CreateComentarioInput = z.infer<typeof CreateComentarioSchema>;

