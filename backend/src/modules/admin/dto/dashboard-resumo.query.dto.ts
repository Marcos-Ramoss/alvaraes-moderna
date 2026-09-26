import { z } from "zod";

export const dashboardResumoQueryDto = z.object({
  dataInicio: z.string().trim().optional(),
  dataFim: z.string().trim().optional(),
});

export type DashboardResumoQueryDto = z.infer<typeof dashboardResumoQueryDto>;
