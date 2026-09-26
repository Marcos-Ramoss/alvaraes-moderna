import { z } from "zod";

export const listarUsuariosQueryDto = z.object({
  busca: z.string().trim().optional(),
  ativo: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
  role: z.enum(["MASTER", "ADMIN"]).optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(30),
});

export type ListarUsuariosQueryDto = z.infer<typeof listarUsuariosQueryDto>;
