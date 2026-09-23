import type { PedidoAnuncio } from "@prisma/client";
import type { PedidoAnuncioResponseDto } from "./dto/pedido-anuncio.response.dto.js";

export class PedidosAnuncioMapper {
  paraResponse(pedido: PedidoAnuncio): PedidoAnuncioResponseDto {
    return {
      id: pedido.id,
      tipo: pedido.tipo,
      nomeResponsavel: pedido.nomeResponsavel,
      contatoResponsavel: pedido.contatoResponsavel,
      nomeComercio: pedido.nomeComercio,
      ...(pedido.categoriaPretendida ? { categoriaPretendida: pedido.categoriaPretendida } : {}),
      ...(pedido.localizacaoResumida ? { localizacaoResumida: pedido.localizacaoResumida } : {}),
      ...(pedido.mensagem ? { mensagem: pedido.mensagem } : {}),
      status: pedido.status,
      criadoEm: pedido.criadoEm.toISOString(),
      alteradoEm: pedido.alteradoEm.toISOString(),
    };
  }
}
