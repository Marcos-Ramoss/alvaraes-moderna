import type { Prisma, StatusContato } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

export class ContatosRepository {
  criar(data: Prisma.ContatoUncheckedCreateInput) {
    return prisma.contato.create({ data });
  }

  listar() {
    return prisma.contato.findMany({
      orderBy: [{ criadoEm: "desc" }],
    });
  }

  buscarPorId(id: string) {
    return prisma.contato.findUnique({ where: { id } });
  }

  atualizarStatus(id: string, status: StatusContato) {
    return prisma.contato.update({
      where: { id },
      data: { status },
    });
  }
}
