import { z } from "zod";

export const registrarLeituraRequestDto = z.object({
  clienteId: z.string().trim().min(16).max(128).regex(/^[a-zA-Z0-9_-]+$/),
});

export type RegistrarLeituraRequestDto = z.infer<typeof registrarLeituraRequestDto>;
