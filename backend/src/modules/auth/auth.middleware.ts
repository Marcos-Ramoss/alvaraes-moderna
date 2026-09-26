import type { NextFunction, Request, Response } from "express";
import type { Permissao, RoleUsuario } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";
import { AuthService } from "./auth.service.js";

declare global {
  namespace Express {
    interface Request {
      usuarioAutenticado?: {
        id: string;
        nome: string;
        email: string;
        role: RoleUsuario;
        permissoes: Permissao[];
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
    const usuario = await authService.buscarUsuarioAtivoParaAutenticacao(payload.sub);
    if (!usuario) {
      return next(new AppError("Usuario nao encontrado ou inativo.", 401));
    }

    req.usuarioAutenticado = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      permissoes: (usuario.permissoes ?? []).map((p) => p.permissao),
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function autorizar(permissaoNecessaria: Permissao) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const usuario = req.usuarioAutenticado;
    if (!usuario) {
      return next(new AppError("Nao autorizado.", 401));
    }

    if (usuario.role === "MASTER") {
      return next();
    }

    if (usuario.permissoes.includes(permissaoNecessaria)) {
      return next();
    }

    return next(
      new AppError("Acesso negado. Voce nao possui permissao para esta funcionalidade.", 403)
    );
  };
}
