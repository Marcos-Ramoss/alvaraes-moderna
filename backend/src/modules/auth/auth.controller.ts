import type { Request, Response } from "express";
import type { LoginRequestDto } from "./dto/login.request.dto.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  login = async (req: Request, res: Response) => {
    const body = req.dadosValidados?.body as LoginRequestDto;
    const resposta = await this.authService.login(body);
    return res.json(resposta);
  };

  me = async (req: Request, res: Response) => {
    const usuarioId = req.usuarioAutenticado?.id;
    if (!usuarioId) return res.status(401).json({ mensagem: "Nao autorizado." });

    const usuario = await this.authService.buscarUsuarioAutenticado(usuarioId);
    return res.json({ usuario });
  };
}
