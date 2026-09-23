import { prisma } from "../../database/prisma.js";
import type { TipoEntidade, StatusComentario } from "@prisma/client";
import type { CreateComentarioInput } from "./dto/create-comentario.dto.js";

export class ComentariosRepository {
  async criar(data: CreateComentarioInput) {
    return prisma.comentario.create({
      data: {
        entidadeTipo: data.entidadeTipo,
        entidadeId: data.entidadeId,
        autorNome: data.autorNome,
        autorEmail: data.autorEmail || null,
        conteudo: data.conteudo,
        status: "PENDENTE",
      },
    });
  }

  async listarAprovadosPorEntidade(entidadeTipo: TipoEntidade, entidadeId: string) {
    return prisma.comentario.findMany({
      where: {
        entidadeTipo,
        entidadeId,
        status: "APROVADO",
      },
      orderBy: {
        criadoEm: "desc",
      },
    });
  }

  async contarAprovados(entidadeTipo: TipoEntidade, entidadeId: string) {
    return prisma.comentario.count({
      where: {
        entidadeTipo,
        entidadeId,
        status: "APROVADO",
      },
    });
  }

  async listarTodosAdmin(limite = 50, pagina = 1, status?: StatusComentario) {
    const skip = (pagina - 1) * limite;
    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      prisma.comentario.findMany({
        where,
        orderBy: { criadoEm: "desc" },
        take: limite,
        skip,
      }),
      prisma.comentario.count({ where }),
    ]);

    return { items, total };
  }

  async atualizarStatus(id: string, status: StatusComentario) {
    return prisma.comentario.update({
      where: { id },
      data: { status },
    });
  }

  async remover(id: string) {
    return prisma.comentario.delete({
      where: { id },
    });
  }
}

export const comentariosRepository = new ComentariosRepository();

