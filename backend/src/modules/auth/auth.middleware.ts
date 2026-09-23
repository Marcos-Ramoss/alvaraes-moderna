import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/errors/app-error.js";
import { AuthService } from "./auth.service.js";

declare global {
  namespace Express {
    interface Request {
      usuarioAutenticado?: {
        id: string;
        email: string;
      };
    }
  }
}

const authService = new AuthService();

export async function autenticarUsuario(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const [tipo, token] = authorization?.split(" ") ?? [];

  if (tipo !== "Bearer" || !token) {
    return next(new AppError("Nao autorizado.", 401));
  }

  try {
    const payload = authService.verificarToken(token);
    req.usuarioAutenticado = {
      id: payload.sub,
      email: payload.email,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
