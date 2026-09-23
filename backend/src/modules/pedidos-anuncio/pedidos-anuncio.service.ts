import type { StatusPedidoAnuncio } from "@prisma/client";
import type { AtualizarStatusPedidoAnuncioRequestDto } from "./dto/atualizar-status-pedido-anuncio.request.dto.js";
import type { CriarPedidoAnuncioRequestDto } from "./dto/criar-pedido-anuncio.request.dto.js";
import { PedidosAnuncioMapper } from "./pedidos-anuncio.mapper.js";
import { PedidosAnuncioRepository } from "./pedidos-anuncio.repository.js";
import { PedidosAnuncioRules } from "./pedidos-anuncio.rules.js";

export class PedidosAnuncioService {
  constructor(
    private readonly pedidosRepository = new PedidosAnuncioRepository(),
    private readonly pedidosMapper = new PedidosAnuncioMapper(),
    private readonly pedidosRules = new PedidosAnuncioRules(),
  ) {}

  async criarPedido(dto: CriarPedidoAnuncioRequestDto) {
    const pedido = await this.pedidosRepository.criar({
      tipo: dto.tipo,
      nomeResponsavel: dto.nomeResponsavel,
      contatoResponsavel: dto.contatoResponsavel,
      nomeComercio: dto.nomeComercio,
      ...(dto.categoriaPretendida ? { categoriaPretendida: dto.categoriaPretendida } : {}),
      ...(dto.localizacaoResumida ? { localizacaoResumida: dto.localizacaoResumida } : {}),
      ...(dto.mensagem ? { mensagem: dto.mensagem } : {}),
    });

    return {
      mensagem: "Pedido de anuncio recebido com sucesso.",
      dados: this.pedidosMapper.paraResponse(pedido),
    };
  }

  async listarPedidos() {
    const pedidos = await this.pedidosRepository.listar();
    return pedidos.map((pedido) => this.pedidosMapper.paraResponse(pedido));
  }

  async atualizarStatus(id: string, dto: AtualizarStatusPedidoAnuncioRequestDto) {
    const pedidoAtual = await this.pedidosRepository.buscarPorId(id);
    this.pedidosRules.validarEncontrado(pedidoAtual);

    const pedido = await this.pedidosRepository.atualizarStatus(
      id,
      dto.status as StatusPedidoAnuncio,
    );

    return this.pedidosMapper.paraResponse(pedido);
  }
}
