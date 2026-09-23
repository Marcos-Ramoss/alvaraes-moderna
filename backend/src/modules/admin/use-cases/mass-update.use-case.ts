import { prisma } from "../../../database/prisma.js";
import type {
  StatusPublicacao,
  StatusComentario,
  StatusContato,
  StatusPedidoAnuncio,
} from "@prisma/client";

export class MassUpdateUseCase {
  async execute(entidade: string, ids: string[], status: string) {
    switch (entidade) {
      case "NOTICIA":
        return prisma.noticia.updateMany({
          where: { id: { in: ids } },
          data: { status: status as StatusPublicacao },
        });
      case "COMERCIO":
        return prisma.comercio.updateMany({
          where: { id: { in: ids } },
          data: { status: status as StatusPublicacao },
        });
      case "EVENTO":
        return prisma.evento.updateMany({
          where: { id: { in: ids } },
          data: { status: status as StatusPublicacao },
        });
      case "CURSO":
        return prisma.oportunidade.updateMany({
          where: { id: { in: ids } },
          data: { status: status as StatusPublicacao },
        });
      case "COMENTARIO":
        return prisma.comentario.updateMany({
          where: { id: { in: ids } },
          data: { status: status as StatusComentario },
        });
      case "CONTATO":
        return prisma.contato.updateMany({
          where: { id: { in: ids } },
          data: { status: status as StatusContato },
        });
      case "PEDIDO_ANUNCIO":
        return prisma.pedidoAnuncio.updateMany({
          where: { id: { in: ids } },
          data: { status: status as StatusPedidoAnuncio },
        });
      default:
        throw new Error("Entidade não suportada para edição em massa.");
    }
  }
}

