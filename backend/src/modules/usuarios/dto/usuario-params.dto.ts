import { z } from "zod";

export const usuarioIdParamsDto = z.object({
  id: z.string().trim().min(1),
});

export type UsuarioIdParamsDto = z.infer<typeof usuarioIdParamsDto>;
