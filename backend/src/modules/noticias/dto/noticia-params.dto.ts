import { z } from "zod";

export const noticiaSlugParamsDto = z.object({
  slug: z.string().trim().min(1),
});

export const noticiaIdParamsDto = z.object({
  id: z.string().trim().min(1),
});
