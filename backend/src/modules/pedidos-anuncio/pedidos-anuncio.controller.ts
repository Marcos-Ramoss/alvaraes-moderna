import type { Request, Response } from "express";
import type { AtualizarStatusPedidoAnuncioRequestDto } from "./dto/atualizar-status-pedido-anuncio.request.dto.js";
import type { CriarPedidoAnuncioRequestDto } from "./dto/criar-pedido-anuncio.request.dto.js";
import { PedidosAnuncioService } from "./pedidos-anuncio.service.js";
import { auditoriaService } from "../auditoria/auditoria.service.js";

type PedidoAnuncioIdParams = { id: string };

export class PedidosAnuncioController {
  constructor(private readonly pedidosService = new PedidosAnuncioService()) {}

  criarPedido = async (req: Request, res: Response) => {
    const body = req.dadosValidados?.body as CriarPedidoAnuncioRequestDto;
    const resultado = await this.pedidosService.criarPedido(body);
    return res.status(201).json(resultado);
  };

  listarPedidos = async (_req: Request, res: Response) => {
    const pedidos = await this.pedidosService.listarPedidos();
    return res.json({ dados: pedidos });
  };

  atualizarStatus = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as PedidoAnuncioIdParams;
    const body = req.dadosValidados?.body as AtualizarStatusPedidoAnuncioRequestDto;
    const pedido = await this.pedidosService.atualizarStatus(params.id, body);

    await auditoriaService.registrar({
      req,
      acao: "STATUS",
      recurso: "PEDIDO_ANUNCIO",
      recursoId: params.id,
      tituloRecurso: pedido.nomeResponsavel,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} alterou o status do pedido de anúncio de '${pedido.nomeResponsavel}' para '${body.status}'.`,
      dadosNovos: { status: body.status },
    });

    return res.json({ dados: pedido });
  };
}
