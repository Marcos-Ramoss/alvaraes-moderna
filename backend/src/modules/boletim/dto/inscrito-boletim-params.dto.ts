import { z } from "zod";

export const inscritoBoletimIdParamsDto = z.object({
  id: z.string().trim().min(1),
});
