import type { Request, Response } from "express";
import type { AtualizarEventoRequestDto } from "./dto/atualizar-evento.request.dto.js";
import type { CriarEventoRequestDto } from "./dto/criar-evento.request.dto.js";
import type {
  ListarEventosAdminQueryDto,
  ListarEventosQueryDto,
} from "./dto/listar-eventos.query.dto.js";
import { EventosService } from "./eventos.service.js";
import { auditoriaService } from "../auditoria/auditoria.service.js";

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

    await auditoriaService.registrar({
      req,
      acao: "CRIAR",
      recurso: "EVENTO",
      recursoId: evento.id,
      tituloRecurso: evento.titulo,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} cadastrou o evento '${evento.titulo}'.`,
      dadosNovos: { id: evento.id, titulo: evento.titulo, status: evento.status },
    });

    return res.status(201).json({ dados: evento });
  };

  atualizarEvento = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as EventoIdParams;
    const body = req.dadosValidados?.body as AtualizarEventoRequestDto;
    const evento = await this.eventosService.atualizarEvento(params.id, body);

    await auditoriaService.registrar({
      req,
      acao: "ATUALIZAR",
      recurso: "EVENTO",
      recursoId: evento.id,
      tituloRecurso: evento.titulo,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} editou o evento '${evento.titulo}'.`,
      dadosNovos: { id: evento.id, titulo: evento.titulo, status: evento.status },
    });

    return res.json({ dados: evento });
  };

  publicarEvento = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as EventoIdParams;
    const evento = await this.eventosService.publicarEvento(params.id);

    await auditoriaService.registrar({
      req,
      acao: "PUBLICAR",
      recurso: "EVENTO",
      recursoId: evento.id,
      tituloRecurso: evento.titulo,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} publicou o evento '${evento.titulo}'.`,
      dadosNovos: { status: evento.status },
    });

    return res.json({ dados: evento });
  };

  excluirEvento = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as EventoIdParams;
    const resultado = await this.eventosService.excluirEvento(params.id);

    await auditoriaService.registrar({
      req,
      acao: "EXCLUIR",
      recurso: "EVENTO",
      recursoId: params.id,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} excluiu o evento (ID: ${params.id}).`,
    });

    return res.json(resultado);
  };
}
