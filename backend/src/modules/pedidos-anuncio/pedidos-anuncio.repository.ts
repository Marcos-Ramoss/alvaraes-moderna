import type { Prisma, StatusPedidoAnuncio } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

export class PedidosAnuncioRepository {
  criar(data: Prisma.PedidoAnuncioUncheckedCreateInput) {
    return prisma.pedidoAnuncio.create({ data });
  }

  listar() {
    return prisma.pedidoAnuncio.findMany({
      orderBy: [{ criadoEm: "desc" }],
    });
  }

  buscarPorId(id: string) {
    return prisma.pedidoAnuncio.findUnique({ where: { id } });
  }

  atualizarStatus(id: string, status: StatusPedidoAnuncio) {
    return prisma.pedidoAnuncio.update({
      where: { id },
      data: { status },
    });
  }
}
