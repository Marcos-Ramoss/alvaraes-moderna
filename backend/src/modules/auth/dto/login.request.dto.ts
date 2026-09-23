import { z } from "zod";

export const loginRequestDto = z.object({
  email: z.string().trim().email().max(180),
  senha: z.string().min(8).max(120),
});

export type LoginRequestDto = z.infer<typeof loginRequestDto>;
