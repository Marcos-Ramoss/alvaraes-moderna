import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3333),
    DATABASE_URL: z
      .string()
      .min(1)
      .default("mysql://alvaraes:alvaraes123456@localhost:3306/alvaraes_moderna"),
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    JWT_SECRET: z.string().min(32).default("troque-este-segredo-em-producao-local"),
  })
  .superRefine((env, ctx) => {
    if (
      env.NODE_ENV === "production" &&
      env.DATABASE_URL === "mysql://alvaraes:alvaraes123456@localhost:3306/alvaraes_moderna"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: "DATABASE_URL precisa ser configurada em producao.",
      });
    }
  });

export const env = envSchema.parse(process.env);
