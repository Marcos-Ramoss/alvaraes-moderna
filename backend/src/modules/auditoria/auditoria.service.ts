import type { Request } from "express";
import { type AcaoAuditoria, Prisma, type RecursoAuditoria } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";
import { AuditoriaRepository } from "./auditoria.repository.js";
import type { ListarAuditoriaQueryDto } from "./dto/listar-auditoria.query.dto.js";

const FUSO_ALVARAES = "-04:00";

function parseDataLimite(data: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return new Date(`${data}T00:00:00.000${FUSO_ALVARAES}`);
  }
  return new Date(data);
}

export type RegistrarAuditoriaInput = {
  req?: Request | undefined;
  usuarioId?: string | undefined;
  usuarioNome?: string | undefined;
  usuarioEmail?: string | undefined;
  acao: AcaoAuditoria;
  recurso: RecursoAuditoria;
  recursoId?: string | undefined;
  tituloRecurso?: string | undefined;
  descricao: string;
  dadosAnteriores?: unknown;
  dadosNovos?: unknown;
};

export class AuditoriaService {
  constructor(private readonly auditoriaRepository = new AuditoriaRepository()) {}

  async registrar(input: RegistrarAuditoriaInput) {
    try {
      const usuarioId = input.usuarioId ?? input.req?.usuarioAutenticado?.id ?? null;
      const usuarioNome =
        input.usuarioNome ?? input.req?.usuarioAutenticado?.nome ?? "Sistema";
      const usuarioEmail =
        input.usuarioEmail ??
        input.req?.usuarioAutenticado?.email ??
        "sistema@alvaraesmoderna.com.br";

      const ip =
        (input.req?.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        input.req?.ip ||
        null;
      const userAgent =
        (input.req?.headers["user-agent"] as string)?.slice(0, 250) || null;

      const dados: Prisma.LogAuditoriaCreateInput = {
        usuarioNome,
        usuarioEmail,
        acao: input.acao,
        recurso: input.recurso,
        recursoId: input.recursoId ?? null,
        tituloRecurso: input.tituloRecurso ?? null,
        descricao: input.descricao,
        dadosAnteriores: input.dadosAnteriores
          ? (input.dadosAnteriores as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        dadosNovos: input.dadosNovos
          ? (input.dadosNovos as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        ip,
        userAgent,
        ...(usuarioId ? { usuario: { connect: { id: usuarioId } } } : {}),
      };

      await this.auditoriaRepository.criar(dados);
    } catch (error) {
      console.error("[AUDITORIA_ERROR] Falha ao registrar log de auditoria:", error);
    }
  }

  async listar(filtros: ListarAuditoriaQueryDto) {
    return this.auditoriaRepository.listar(filtros);
  }

  async excluirPorId(id: string, req?: Request) {
    const registro = await this.auditoriaRepository.buscarPorId(id);
    if (!registro) {
      throw new AppError("Registro de auditoria não encontrado.", 404);
    }

    await this.auditoriaRepository.excluirPorId(id);

    await this.registrar({
      req,
      acao: "EXCLUIR",
      recurso: "SISTEMA",
      recursoId: id,
      tituloRecurso: registro.tituloRecurso ?? undefined,
      descricao: `Excluiu o registro de auditoria de ${registro.usuarioNome} (${registro.descricao.slice(0, 80)}...).`,
      dadosAnteriores: {
        id: registro.id,
        acao: registro.acao,
        recurso: registro.recurso,
        criadoEm: registro.criadoEm,
      },
    });

    return { sucesso: true };
  }

  async contarAntigos(dataLimiteStr: string) {
    const dataLimite = parseDataLimite(dataLimiteStr);
    if (Number.isNaN(dataLimite.getTime())) {
      throw new AppError("Data limite inválida.", 400);
    }
    const total = await this.auditoriaRepository.contarAnteriores(dataLimite);
    return { total, dataLimite: dataLimiteStr };
  }

  async excluirAntigos(dataLimiteStr: string, req?: Request) {
    const dataLimite = parseDataLimite(dataLimiteStr);
    if (Number.isNaN(dataLimite.getTime())) {
      throw new AppError("Data limite inválida.", 400);
    }

    const totalExcluidos = await this.auditoriaRepository.excluirAnteriores(dataLimite);

    await this.registrar({
      req,
      acao: "EXCLUIR",
      recurso: "SISTEMA",
      descricao: `Excluiu em lote ${totalExcluidos} registro(s) de auditoria anteriores a ${dataLimiteStr}.`,
      dadosNovos: {
        dataLimite: dataLimiteStr,
        totalExcluidos,
      },
    });

    return { totalExcluidos, dataLimite: dataLimiteStr };
  }
}

export const auditoriaService = new AuditoriaService();
