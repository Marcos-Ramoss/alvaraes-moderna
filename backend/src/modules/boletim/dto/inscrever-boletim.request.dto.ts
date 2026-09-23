import { z } from "zod";

export const inscreverBoletimRequestDto = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180).transform((email) => email.toLowerCase()),
});

export type InscreverBoletimRequestDto = z.infer<typeof inscreverBoletimRequestDto>;
