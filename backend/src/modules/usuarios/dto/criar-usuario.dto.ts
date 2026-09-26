import { z } from "zod";

export const permissaoSchema = z.enum([
  "NOTICIAS",
  "COMERCIOS",
  "EVENTOS",
  "CURSOS",
  "COMENTARIOS",
  "BOLETIM",
  "CONTATOS",
  "ANUNCIOS",
  "USUARIOS",
  "AUDITORIA",
]);

export const criarUsuarioDto = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(120),
  email: z.string().trim().email("E-mail inválido").max(180),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
  role: z.enum(["MASTER", "ADMIN"]).default("ADMIN"),
  ativo: z.boolean().default(true),
  permissoes: z.array(permissaoSchema).default([]),
});

export type CriarUsuarioDto = z.infer<typeof criarUsuarioDto>;
