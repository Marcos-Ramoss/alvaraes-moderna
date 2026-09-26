import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import type { ListarAuditoriaQueryDto } from "./dto/listar-auditoria.query.dto.js";

export class AuditoriaRepository {
  async criar(dados: Prisma.LogAuditoriaCreateInput) {
    return prisma.logAuditoria.create({
      data: dados,
    });
  }

  async listar(filtros: ListarAuditoriaQueryDto) {
    const where: Prisma.LogAuditoriaWhereInput = {};

    if (filtros.usuarioId) {
      where.usuarioId = filtros.usuarioId;
    }

    if (filtros.acao) {
      where.acao = filtros.acao;
    }

    if (filtros.recurso) {
      where.recurso = filtros.recurso;
    }

    if (filtros.dataInicio || filtros.dataFim) {
      where.criadoEm = {};
      if (filtros.dataInicio) {
        where.criadoEm.gte = new Date(filtros.dataInicio);
      }
      if (filtros.dataFim) {
        const fim = new Date(filtros.dataFim);
        fim.setUTCHours(23, 59, 59, 999);
        where.criadoEm.lte = fim;
      }
    }

    if (filtros.busca) {
      const termo = filtros.busca;
      where.OR = [
        { descricao: { contains: termo, mode: "insensitive" } },
        { tituloRecurso: { contains: termo, mode: "insensitive" } },
        { usuarioNome: { contains: termo, mode: "insensitive" } },
        { usuarioEmail: { contains: termo, mode: "insensitive" } },
      ];
    }

    const skip = (filtros.pagina - 1) * filtros.limite;

    const [itens, total] = await Promise.all([
      prisma.logAuditoria.findMany({
        where,
        orderBy: { criadoEm: "desc" },
        skip,
        take: filtros.limite,
      }),
      prisma.logAuditoria.count({ where }),
    ]);

    return { itens, total };
  }
}
