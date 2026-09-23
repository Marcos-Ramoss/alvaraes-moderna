import { z } from "zod";

export const comercioSlugParamsDto = z.object({
  slug: z.string().trim().min(1),
});

export const comercioIdParamsDto = z.object({
  id: z.string().trim().min(1),
});
