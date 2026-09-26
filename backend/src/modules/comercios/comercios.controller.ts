import type { Request, Response } from "express";
import type { AtualizarComercioRequestDto } from "./dto/atualizar-comercio.request.dto.js";
import type { CriarComercioRequestDto } from "./dto/criar-comercio.request.dto.js";
import type {
  ListarComerciosAdminQueryDto,
  ListarComerciosQueryDto,
} from "./dto/listar-comercios.query.dto.js";
import { ComerciosService } from "./comercios.service.js";
import { auditoriaService } from "../auditoria/auditoria.service.js";

type ComercioSlugParams = { slug: string };
type ComercioIdParams = { id: string };

export class ComerciosController {
  constructor(private readonly comerciosService = new ComerciosService()) {}

  listarCategorias = async (req: Request, res: Response) => {
    const categorias = await this.comerciosService.listarCategorias();
    return res.json({ dados: categorias });
  };

  listarPublicados = async (req: Request, res: Response) => {
    const query = req.dadosValidados?.query as ListarComerciosQueryDto;
    const { itens, total } = await this.comerciosService.listarPublicados(query);
    return res.json({ dados: itens, total });
  };

  buscarPublicadoPorSlug = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as ComercioSlugParams;
    const comercio = await this.comerciosService.buscarPublicadoPorSlug(params.slug);
    return res.json({ dados: comercio });
  };

  listarAdministracao = async (req: Request, res: Response) => {
    const query = req.dadosValidados?.query as ListarComerciosAdminQueryDto;
    const { itens, total } = await this.comerciosService.listarAdmin(query);
    return res.json({ dados: itens, total });
  };

  criarComercio = async (req: Request, res: Response) => {
    const body = req.dadosValidados?.body as CriarComercioRequestDto;
    const comercio = await this.comerciosService.criarComercio(body);

    await auditoriaService.registrar({
      req,
      acao: "CRIAR",
      recurso: "COMERCIO",
      recursoId: comercio.id,
      tituloRecurso: comercio.nome,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} cadastrou o comércio '${comercio.nome}'.`,
      dadosNovos: { id: comercio.id, nome: comercio.nome, status: comercio.status },
    });

    return res.status(201).json({ dados: comercio });
  };

  atualizarComercio = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as ComercioIdParams;
    const body = req.dadosValidados?.body as AtualizarComercioRequestDto;
    const comercio = await this.comerciosService.atualizarComercio(params.id, body);

    await auditoriaService.registrar({
      req,
      acao: "ATUALIZAR",
      recurso: "COMERCIO",
      recursoId: comercio.id,
      tituloRecurso: comercio.nome,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} editou o comércio '${comercio.nome}'.`,
      dadosNovos: { id: comercio.id, nome: comercio.nome, status: comercio.status },
    });

    return res.json({ dados: comercio });
  };

  publicarComercio = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as ComercioIdParams;
    const comercio = await this.comerciosService.publicarComercio(params.id);

    await auditoriaService.registrar({
      req,
      acao: "PUBLICAR",
      recurso: "COMERCIO",
      recursoId: comercio.id,
      tituloRecurso: comercio.nome,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} publicou o comércio '${comercio.nome}'.`,
      dadosNovos: { status: comercio.status },
    });

    return res.json({ dados: comercio });
  };

  excluirComercio = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as ComercioIdParams;
    const resultado = await this.comerciosService.excluirComercio(params.id);

    await auditoriaService.registrar({
      req,
      acao: "EXCLUIR",
      recurso: "COMERCIO",
      recursoId: params.id,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} excluiu o comércio (ID: ${params.id}).`,
    });

    return res.json(resultado);
  };
}
