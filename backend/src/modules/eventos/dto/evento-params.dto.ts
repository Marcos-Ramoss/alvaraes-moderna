import { z } from "zod";

export const eventoIdParamsDto = z.object({
  id: z.string().trim().min(1),
});
