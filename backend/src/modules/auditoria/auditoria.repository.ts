import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import type { ListarAuditoriaQueryDto } from "./dto/listar-auditoria.query.dto.js";

// Fuso oficial do município de Alvarães / Manaus (Amazonas: UTC-4)
const FUSO_ALVARAES = "-04:00";

function parseDataInicio(data: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return new Date(`${data}T00:00:00.000${FUSO_ALVARAES}`);
  }
  return new Date(data);
}

export function parseDataFim(data: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return new Date(`${data}T23:59:59.999${FUSO_ALVARAES}`);
  }
  const fim = new Date(data);
  return fim;
}

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
        const inicio = parseDataInicio(filtros.dataInicio);
        if (!Number.isNaN(inicio.getTime())) {
          where.criadoEm.gte = inicio;
        }
      }
      if (filtros.dataFim) {
        const fim = parseDataFim(filtros.dataFim);
        if (!Number.isNaN(fim.getTime())) {
          where.criadoEm.lte = fim;
        }
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

  async buscarPorId(id: string) {
    return prisma.logAuditoria.findUnique({
      where: { id },
    });
  }

  async excluirPorId(id: string) {
    return prisma.logAuditoria.delete({
      where: { id },
    });
  }

  async contarAnteriores(dataLimite: Date) {
    return prisma.logAuditoria.count({
      where: {
        criadoEm: {
          lte: dataLimite,
        },
      },
    });
  }

  async excluirAnteriores(dataLimite: Date) {
    const resultado = await prisma.logAuditoria.deleteMany({
      where: {
        criadoEm: {
          lte: dataLimite,
        },
      },
    });
    return resultado.count;
  }
}
