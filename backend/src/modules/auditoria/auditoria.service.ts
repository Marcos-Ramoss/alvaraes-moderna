import type { Request } from "express";
import { type AcaoAuditoria, Prisma, type RecursoAuditoria } from "@prisma/client";
import { AuditoriaRepository } from "./auditoria.repository.js";
import type { ListarAuditoriaQueryDto } from "./dto/listar-auditoria.query.dto.js";

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
}

export const auditoriaService = new AuditoriaService();
