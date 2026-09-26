import type { Request, Response } from "express";
import type { AtualizarUsuarioDto } from "./dto/atualizar-usuario.dto.js";
import type { CriarUsuarioDto } from "./dto/criar-usuario.dto.js";
import type { ListarUsuariosQueryDto } from "./dto/listar-usuarios.query.dto.js";
import type { UsuarioIdParamsDto } from "./dto/usuario-params.dto.js";
import { UsuariosService } from "./usuarios.service.js";

export class UsuariosController {
  constructor(private readonly usuariosService = new UsuariosService()) {}

  listar = async (req: Request, res: Response) => {
    const query = (req.dadosValidados?.query ?? req.query) as ListarUsuariosQueryDto;
    const { itens, total } = await this.usuariosService.listar(query);
    return res.json({ dados: itens, total });
  };

  buscarPorId = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as UsuarioIdParamsDto;
    const usuario = await this.usuariosService.buscarPorId(params.id);
    return res.json({ dados: usuario });
  };

  criar = async (req: Request, res: Response) => {
    const body = req.dadosValidados?.body as CriarUsuarioDto;
    const usuario = await this.usuariosService.criar(body, req);
    return res.status(201).json({ dados: usuario });
  };

  atualizar = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as UsuarioIdParamsDto;
    const body = req.dadosValidados?.body as AtualizarUsuarioDto;
    const usuario = await this.usuariosService.atualizar(params.id, body, req);
    return res.json({ dados: usuario });
  };

  alterarStatus = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as UsuarioIdParamsDto;
    const { ativo } = req.body as { ativo: boolean };
    const usuario = await this.usuariosService.alterarStatus(params.id, Boolean(ativo), req);
    return res.json({ dados: usuario });
  };

  excluir = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as UsuarioIdParamsDto;
    const resultado = await this.usuariosService.excluir(params.id, req);
    return res.json({ dados: resultado });
  };
}
