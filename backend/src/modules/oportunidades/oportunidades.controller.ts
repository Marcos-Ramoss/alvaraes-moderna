import type { Request, Response } from "express";
import type { AtualizarOportunidadeRequestDto } from "./dto/atualizar-oportunidade.request.dto.js";
import type { CriarOportunidadeRequestDto } from "./dto/criar-oportunidade.request.dto.js";
import type {
  ListarOportunidadesAdminQueryDto,
  ListarOportunidadesQueryDto,
} from "./dto/listar-oportunidades.query.dto.js";
import { OportunidadesService } from "./oportunidades.service.js";

type OportunidadeIdParams = { id: string };

export class OportunidadesController {
  constructor(private readonly oportunidadesService = new OportunidadesService()) {}

  listarCategorias = async (req: Request, res: Response) => {
    const categorias = await this.oportunidadesService.listarCategorias();
    return res.json({ dados: categorias });
  };

  listarPublicadas = async (req: Request, res: Response) => {
    const query = req.dadosValidados?.query as ListarOportunidadesQueryDto;
    const { itens, total } = await this.oportunidadesService.listarPublicadas(query);
    return res.json({ dados: itens, total });
  };

  listarAdministracao = async (req: Request, res: Response) => {
    const query = req.dadosValidados?.query as ListarOportunidadesAdminQueryDto;
    const { itens, total } = await this.oportunidadesService.listarAdministracao(query);
    return res.json({ dados: itens, total });
  };

  buscarPublicadaPorId = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as OportunidadeIdParams;
    const oportunidade = await this.oportunidadesService.buscarPublicadaPorId(params.id);
    return res.json({ dados: oportunidade });
  };

  criarOportunidade = async (req: Request, res: Response) => {
    const body = req.dadosValidados?.body as CriarOportunidadeRequestDto;
    const oportunidade = await this.oportunidadesService.criarOportunidade(body);
    return res.status(201).json({ dados: oportunidade });
  };

  atualizarOportunidade = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as OportunidadeIdParams;
    const body = req.dadosValidados?.body as AtualizarOportunidadeRequestDto;
    const oportunidade = await this.oportunidadesService.atualizarOportunidade(params.id, body);
    return res.json({ dados: oportunidade });
  };

  publicarOportunidade = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as OportunidadeIdParams;
    const oportunidade = await this.oportunidadesService.publicarOportunidade(params.id);
    return res.json({ dados: oportunidade });
  };

  excluirOportunidade = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as OportunidadeIdParams;
    const resultado = await this.oportunidadesService.excluirOportunidade(params.id);
    return res.json(resultado);
  };
}
