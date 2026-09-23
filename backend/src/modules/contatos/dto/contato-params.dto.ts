import { z } from "zod";

export const contatoIdParamsDto = z.object({
  id: z.string().trim().min(1),
});
