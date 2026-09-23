import { prisma } from "../../database/prisma.js";
import type { TipoEntidade } from "@prisma/client";

export class CurtidasRepository {
  async encontrarPorClienteEEntidade(entidadeTipo: TipoEntidade, entidadeId: string, clienteId: string) {
    return prisma.curtida.findUnique({
      where: {
        entidadeTipo_entidadeId_clienteId: {
          entidadeTipo,
          entidadeId,
          clienteId,
        },
      },
    });
  }

  async adicionar(entidadeTipo: TipoEntidade, entidadeId: string, clienteId: string) {
    return prisma.curtida.create({
      data: {
        entidadeTipo,
        entidadeId,
        clienteId,
      },
    });
  }

  async remover(id: string) {
    return prisma.curtida.delete({
      where: { id },
    });
  }

  async contarPorEntidade(entidadeTipo: TipoEntidade, entidadeId: string) {
    return prisma.curtida.count({
      where: {
        entidadeTipo,
        entidadeId,
      },
    });
  }
}

export const curtidasRepository = new CurtidasRepository();

