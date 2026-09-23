import { z } from "zod";
import { StatusComentario } from "@prisma/client";

export const UpdateStatusComentarioSchema = z.object({
  status: z.nativeEnum(StatusComentario),
});

export type UpdateStatusComentarioInput = z.infer<typeof UpdateStatusComentarioSchema>;

