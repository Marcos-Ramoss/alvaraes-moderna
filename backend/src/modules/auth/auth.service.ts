import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../../common/errors/app-error.js";
import { env } from "../../config/env.js";
import type { LoginRequestDto } from "./dto/login.request.dto.js";
import { AuthMapper, type UsuarioLogadoResponseDto } from "./auth.mapper.js";
import { AuthRepository } from "./auth.repository.js";

type TokenPayload = {
  sub: string;
  email: string;
  type: "access";
};

export class AuthService {
  constructor(
    private readonly authRepository = new AuthRepository(),
    private readonly authMapper = new AuthMapper(),
  ) {}

  async login(dto: LoginRequestDto) {
    const usuario = await this.authRepository.buscarUsuarioPorEmail(dto.email);
    if (!usuario || !usuario.ativo) {
      throw new AppError("E-mail ou senha invalidos.", 401);
    }

    const senhaConfere = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaConfere) {
      throw new AppError("E-mail ou senha invalidos.", 401);
    }

    const token = this.gerarToken({
      sub: usuario.id,
      email: usuario.email,
      type: "access",
    });

    return {
      token,
      usuario: this.authMapper.paraUsuarioLogado(usuario),
    };
  }

  async buscarUsuarioAutenticado(id: string): Promise<UsuarioLogadoResponseDto> {
    const usuario = await this.authRepository.buscarUsuarioPorId(id);
    if (!usuario || !usuario.ativo) {
      throw new AppError("Usuario nao encontrado ou inativo.", 401);
    }

    return this.authMapper.paraUsuarioLogado(usuario);
  }

  async buscarUsuarioAtivoParaAutenticacao(id: string) {
    const usuario = await this.authRepository.buscarUsuarioPorId(id);
    if (!usuario || !usuario.ativo) {
      return null;
    }
    return usuario;
  }

  verificarToken(token: string) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      if (payload.type !== "access") throw new Error("Token invalido.");
      return payload;
    } catch {
      throw new AppError("Token invalido ou expirado.", 401);
    }
  }

  private gerarToken(payload: TokenPayload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "8h" });
  }
}
