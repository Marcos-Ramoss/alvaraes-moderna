import type { PedidoAnuncio } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";

export class PedidosAnuncioRules {
  validarEncontrado(pedido: PedidoAnuncio | null) {
    if (!pedido) throw new AppError("Pedido de anuncio nao encontrado.", 404);
  }
}
