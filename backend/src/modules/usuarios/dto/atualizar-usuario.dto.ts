import { z } from "zod";
import { permissaoSchema } from "./criar-usuario.dto.js";

export const atualizarUsuarioDto = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(120).optional(),
  email: z.string().trim().email("E-mail inválido").max(180).optional(),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100).optional(),
  role: z.enum(["MASTER", "ADMIN"]).optional(),
  ativo: z.boolean().optional(),
  permissoes: z.array(permissaoSchema).optional(),
});

export type AtualizarUsuarioDto = z.infer<typeof atualizarUsuarioDto>;
