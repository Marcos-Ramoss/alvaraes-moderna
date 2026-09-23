import { z } from "zod";

export const pedidoAnuncioIdParamsDto = z.object({
  id: z.string().trim().min(1),
});
