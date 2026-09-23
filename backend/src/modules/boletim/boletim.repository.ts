import { prisma } from "../../database/prisma.js";

export class BoletimRepository {
  buscarInscritoPorEmail(email: string) {
    return prisma.inscritoBoletim.findUnique({ where: { email } });
  }

  buscarInscritoPorId(id: string) {
    return prisma.inscritoBoletim.findUnique({ where: { id } });
  }

  criarInscrito(data: { nome: string; email: string; origem: string }) {
    return prisma.inscritoBoletim.create({ data });
  }

  reativarInscrito(id: string, data: { nome: string; origem: string }) {
    return prisma.inscritoBoletim.update({
      where: { id },
      data: {
        nome: data.nome,
        origem: data.origem,
        ativo: true,
      },
    });
  }

  listarInscritos() {
    return prisma.inscritoBoletim.findMany({
      where: { ativo: true },
      orderBy: [{ criadoEm: "desc" }],
    });
  }

  contarInscritos() {
    return prisma.inscritoBoletim.count({ where: { ativo: true } });
  }

  removerInscrito(id: string) {
    return prisma.inscritoBoletim.update({
      where: { id },
      data: { ativo: false },
    });
  }

  listarNoticiasDaSemana(inicio: Date, fim: Date) {
    return prisma.noticia.findMany({
      where: {
        status: "PUBLICADO",
        publicadoEm: {
          gte: inicio,
          lte: fim,
        },
      },
      orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
      take: 5,
    });
  }

  listarEventosProximosDias(inicio: Date, fim: Date) {
    return prisma.evento.findMany({
      where: {
        status: "PUBLICADO",
        data: {
          gte: inicio,
          lte: fim,
        },
      },
      orderBy: [{ data: "asc" }],
      take: 5,
    });
  }

  listarInscricoesAbertas(agora: Date) {
    return prisma.oportunidade.findMany({
      where: {
        status: "PUBLICADO",
        prazo: {
          gte: agora,
        },
      },
      orderBy: [{ prazo: "asc" }],
      take: 5,
    });
  }
}
