import { z } from "zod";

export const oportunidadeIdParamsDto = z.object({
  id: z.string().trim().min(1),
});
