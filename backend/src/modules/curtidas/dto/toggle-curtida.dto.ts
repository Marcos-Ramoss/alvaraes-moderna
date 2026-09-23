import { z } from "zod";
import { TipoEntidade } from "@prisma/client";

export const ToggleCurtidaSchema = z.object({
  entidadeTipo: z.nativeEnum(TipoEntidade),
  entidadeId: z.string().min(1),
  clienteId: z.string().min(1),
});

export type ToggleCurtidaInput = z.infer<typeof ToggleCurtidaSchema>;

