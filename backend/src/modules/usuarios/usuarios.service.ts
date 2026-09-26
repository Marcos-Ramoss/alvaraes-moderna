import bcrypt from "bcryptjs";
import type { Request } from "express";
import type { Permissao, RoleUsuario } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";
import { auditoriaService } from "../auditoria/auditoria.service.js";
import type { AtualizarUsuarioDto } from "./dto/atualizar-usuario.dto.js";
import type { CriarUsuarioDto } from "./dto/criar-usuario.dto.js";
import type { ListarUsuariosQueryDto } from "./dto/listar-usuarios.query.dto.js";
import { UsuariosRepository } from "./usuarios.repository.js";

const EMAIL_MASTER_PROTEGIDO = "admin@alvaraesmoderna.com.br";

export class UsuariosService {
  constructor(private readonly usuariosRepository = new UsuariosRepository()) {}

  async listar(filtros: ListarUsuariosQueryDto) {
    return this.usuariosRepository.listar(filtros);
  }

  async buscarPorId(id: string) {
    const usuario = await this.usuariosRepository.buscarPorId(id);
    if (!usuario) {
      throw new AppError("Usuário não encontrado.", 404);
    }
    const { senhaHash: _, ...seguro } = usuario;
    return seguro;
  }

  async criar(dto: CriarUsuarioDto, req?: Request) {
    const usuarioExistente = await this.usuariosRepository.buscarPorEmail(dto.email);
    if (usuarioExistente) {
      throw new AppError("Já existe um usuário cadastrado com este e-mail.", 409);
    }

    if (dto.role === "MASTER" && req?.usuarioAutenticado?.role !== "MASTER") {
      throw new AppError("Apenas administradores Master podem criar novos usuários Master.", 403);
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.usuariosRepository.criar({
      nome: dto.nome,
      email: dto.email,
      senhaHash,
      role: dto.role as RoleUsuario,
      ativo: dto.ativo,
      permissoes: dto.permissoes,
    });

    await auditoriaService.registrar({
      req,
      acao: "CRIAR",
      recurso: "USUARIO",
      recursoId: usuario.id,
      tituloRecurso: usuario.nome,
      descricao: `${req?.usuarioAutenticado?.nome ?? "Administrador"} cadastrou o usuário administrativo '${usuario.nome}' (${usuario.email}).`,
      dadosNovos: {
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        ativo: usuario.ativo,
        permissoes: usuario.permissoes,
      },
    });

    const { senhaHash: _, ...seguro } = usuario;
    return seguro;
  }

  async atualizar(id: string, dto: AtualizarUsuarioDto, req?: Request) {
    const usuarioExistente = await this.usuariosRepository.buscarPorId(id);
    if (!usuarioExistente) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    if (dto.email && dto.email !== usuarioExistente.email) {
      const emailEmUso = await this.usuariosRepository.buscarPorEmail(dto.email);
      if (emailEmUso && emailEmUso.id !== id) {
        throw new AppError("Este e-mail já está em uso por outro usuário.", 409);
      }
    }

    // Proteções da conta Master
    if (usuarioExistente.email === EMAIL_MASTER_PROTEGIDO) {
      if (dto.role && dto.role !== "MASTER") {
        throw new AppError("O papel do administrador Master principal não pode ser rebaixado.", 400);
      }
      if (dto.ativo === false) {
        throw new AppError("O administrador Master principal não pode ser desativado.", 400);
      }
    }

    let senhaHash: string | undefined;
    if (dto.senha) {
      senhaHash = await bcrypt.hash(dto.senha, 10);
    }

    const dadosAtualizar: {
      nome?: string;
      email?: string;
      senhaHash?: string;
      role?: RoleUsuario;
      ativo?: boolean;
      permissoes?: Permissao[];
    } = {
      ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(senhaHash !== undefined ? { senhaHash } : {}),
      ...(dto.role !== undefined ? { role: dto.role as RoleUsuario } : {}),
      ...(dto.ativo !== undefined ? { ativo: dto.ativo } : {}),
      ...(dto.permissoes !== undefined ? { permissoes: dto.permissoes as Permissao[] } : {}),
    };

    const usuarioAtualizado = await this.usuariosRepository.atualizar(id, dadosAtualizar);

    await auditoriaService.registrar({
      req,
      acao: "ATUALIZAR",
      recurso: "USUARIO",
      recursoId: usuarioAtualizado.id,
      tituloRecurso: usuarioAtualizado.nome,
      descricao: `${req?.usuarioAutenticado?.nome ?? "Administrador"} alterou os dados/permissões do usuário '${usuarioAtualizado.nome}'.`,
      dadosAnteriores: {
        nome: usuarioExistente.nome,
        email: usuarioExistente.email,
        role: usuarioExistente.role,
        ativo: usuarioExistente.ativo,
        permissoes: usuarioExistente.permissoes,
      },
      dadosNovos: {
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        role: usuarioAtualizado.role,
        ativo: usuarioAtualizado.ativo,
        permissoes: usuarioAtualizado.permissoes,
      },
    });

    const { senhaHash: _, ...seguro } = usuarioAtualizado;
    return seguro;
  }

  async alterarStatus(id: string, ativo: boolean, req?: Request) {
    const usuarioExistente = await this.usuariosRepository.buscarPorId(id);
    if (!usuarioExistente) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    if (usuarioExistente.email === EMAIL_MASTER_PROTEGIDO && !ativo) {
      throw new AppError("O administrador Master principal não pode ser desativado.", 400);
    }

    if (req?.usuarioAutenticado?.id === id && !ativo) {
      throw new AppError("Você não pode desativar seu próprio usuário.", 400);
    }

    if (usuarioExistente.role === "MASTER" && !ativo) {
      const mastersAtivos = await this.usuariosRepository.contarMastersAtivos();
      if (mastersAtivos <= 1) {
        throw new AppError("Não é permitido desativar o único administrador Master do sistema.", 400);
      }
    }

    const usuarioAtualizado = await this.usuariosRepository.alterarStatus(id, ativo);

    await auditoriaService.registrar({
      req,
      acao: "STATUS",
      recurso: "USUARIO",
      recursoId: usuarioAtualizado.id,
      tituloRecurso: usuarioAtualizado.nome,
      descricao: `${req?.usuarioAutenticado?.nome ?? "Administrador"} ${ativo ? "ativou" : "desativou"} o usuário '${usuarioAtualizado.nome}'.`,
      dadosAnteriores: { ativo: usuarioExistente.ativo },
      dadosNovos: { ativo: usuarioAtualizado.ativo },
    });

    const { senhaHash: _, ...seguro } = usuarioAtualizado;
    return seguro;
  }

  async excluir(id: string, req?: Request) {
    const usuarioExistente = await this.usuariosRepository.buscarPorId(id);
    if (!usuarioExistente) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    if (usuarioExistente.email === EMAIL_MASTER_PROTEGIDO || usuarioExistente.role === "MASTER") {
      throw new AppError("Não é permitido excluir um administrador Master.", 400);
    }

    if (req?.usuarioAutenticado?.id === id) {
      throw new AppError("Você não pode excluir sua própria conta.", 400);
    }

    await this.usuariosRepository.excluir(id);

    await auditoriaService.registrar({
      req,
      acao: "EXCLUIR",
      recurso: "USUARIO",
      recursoId: id,
      tituloRecurso: usuarioExistente.nome,
      descricao: `${req?.usuarioAutenticado?.nome ?? "Administrador"} excluiu o usuário '${usuarioExistente.nome}' (${usuarioExistente.email}).`,
      dadosAnteriores: {
        nome: usuarioExistente.nome,
        email: usuarioExistente.email,
        role: usuarioExistente.role,
        ativo: usuarioExistente.ativo,
        permissoes: usuarioExistente.permissoes,
      },
    });

    return { sucesso: true };
  }
}
