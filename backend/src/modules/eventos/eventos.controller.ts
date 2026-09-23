import type { Request, Response } from "express";
import type { AtualizarEventoRequestDto } from "./dto/atualizar-evento.request.dto.js";
import type { CriarEventoRequestDto } from "./dto/criar-evento.request.dto.js";
import type {
  ListarEventosAdminQueryDto,
  ListarEventosQueryDto,
} from "./dto/listar-eventos.query.dto.js";
import { EventosService } from "./eventos.service.js";

type EventoIdParams = { id: string };

export class EventosController {
  constructor(private readonly eventosService = new EventosService()) {}

  listarCategorias = async (req: Request, res: Response) => {
    const categorias = await this.eventosService.listarCategorias();
    return res.json({ dados: categorias });
  };

  listarPublicados = async (req: Request, res: Response) => {
    const query = req.dadosValidados?.query as ListarEventosQueryDto;
    const { itens, total } = await this.eventosService.listarPublicados(query);
    return res.json({ dados: itens, total });
  };

  listarAdministracao = async (req: Request, res: Response) => {
    const query = req.dadosValidados?.query as ListarEventosAdminQueryDto;
    const { itens, total } = await this.eventosService.listarAdministracao(query);
    return res.json({ dados: itens, total });
  };

  buscarPublicadoPorId = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as EventoIdParams;
    const evento = await this.eventosService.buscarPublicadoPorId(params.id);
    return res.json({ dados: evento });
  };

  criarEvento = async (req: Request, res: Response) => {
    const body = req.dadosValidados?.body as CriarEventoRequestDto;
    const evento = await this.eventosService.criarEvento(body);
    return res.status(201).json({ dados: evento });
  };

  atualizarEvento = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as EventoIdParams;
    const body = req.dadosValidados?.body as AtualizarEventoRequestDto;
    const evento = await this.eventosService.atualizarEvento(params.id, body);
    return res.json({ dados: evento });
  };

  publicarEvento = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as EventoIdParams;
    const evento = await this.eventosService.publicarEvento(params.id);
    return res.json({ dados: evento });
  };

  excluirEvento = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as EventoIdParams;
    const resultado = await this.eventosService.excluirEvento(params.id);
    return res.json(resultado);
  };
}
