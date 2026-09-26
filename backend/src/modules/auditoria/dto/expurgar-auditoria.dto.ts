import { z } from "zod";

export const logAuditoriaIdParamsDto = z.object({
  id: z.string().trim().min(1, "ID do registro de auditoria é obrigatório"),
});

export type LogAuditoriaIdParamsDto = z.infer<typeof logAuditoriaIdParamsDto>;

export const contarAuditoriaAntigosQueryDto = z.object({
  dataLimite: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data limite deve estar no formato AAAA-MM-DD"),
});

export type ContarAuditoriaAntigosQueryDto = z.infer<typeof contarAuditoriaAntigosQueryDto>;

export const expurgarAuditoriaBodyDto = z.object({
  dataLimite: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data limite deve estar no formato AAAA-MM-DD"),
});

export type ExpurgarAuditoriaBodyDto = z.infer<typeof expurgarAuditoriaBodyDto>;
