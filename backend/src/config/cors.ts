import type { CorsOptions } from "cors";
import { env } from "./env.js";

export const corsOptions: CorsOptions = {
  origin: env.NODE_ENV === "production" ? env.FRONTEND_URL : true,
  credentials: true,
};
