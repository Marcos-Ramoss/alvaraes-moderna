import type { Request, Response } from "express";
import type { Permissao, RecursoAuditoria } from "@prisma/client";
import { AuthService } from "../auth/auth.service.js";
import { AdminService } from "./admin.service.js";
import { MassDeleteUseCase } from "./use-cases/mass-delete.use-case.js";
import { MassUpdateUseCase } from "./use-cases/mass-update.use-case.js";
import { MassDeleteSchema, MassUpdateSchema } from "./dto/mass-action.dto.js";
import { auditoriaService } from "../auditoria/auditoria.service.js";

const massDeleteUseCase = new MassDeleteUseCase();
const massUpdateUseCase = new MassUpdateUseCase();

const entidadePermissaoMap: Record<string, Permissao> = {
  NOTICIA: "NOTICIAS",
  COMERCIO: "COMERCIOS",
  EVENTO: "EVENTOS",
  CURSO: "CURSOS",
  COMENTARIO: "COMENTARIOS",
  CONTATO: "CONTATOS",
  PEDIDO_ANUNCIO: "ANUNCIOS",
};

const entidadeRecursoMap: Record<string, RecursoAuditoria> = {
  NOTICIA: "NOTICIA",
  COMERCIO: "COMERCIO",
  EVENTO: "EVENTO",
  CURSO: "CURSO",
  COMENTARIO: "COMENTARIO",
  CONTATO: "CONTATO",
  PEDIDO_ANUNCIO: "PEDIDO_ANUNCIO",
};

export class AdminController {
  constructor(
    private readonly adminService = new AdminService(),
    private readonly authService = new AuthService(),
  ) {}

  buscarResumo = async (req: Request, res: Response) => {
    const usuarioId = req.usuarioAutenticado?.id;
    const isMaster = req.usuarioAutenticado?.role === "MASTER";
    const permissoes = req.usuarioAutenticado?.permissoes;
    const { dataInicio, dataFim } = req.query as { dataInicio?: string; dataFim?: string };

    const [resumo, usuario] = await Promise.all([
      this.adminService.buscarResumo({
        dataInicio,
        dataFim,
        permissoes,
        isMaster,
      }),
      usuarioId ? this.authService.buscarUsuarioAutenticado(usuarioId) : Promise.resolve(undefined),
    ]);

    return res.json({ ...resumo, usuario });
  };

  acaoMassaDelete = async (req: Request, res: Response) => {
    try {
      const { entidade, ids } = MassDeleteSchema.parse(req.body);
      const permissaoNecessaria = entidadePermissaoMap[entidade];
      const usuario = req.usuarioAutenticado;

      if (usuario && usuario.role !== "MASTER" && (!permissaoNecessaria || !usuario.permissoes.includes(permissaoNecessaria))) {
        return res.status(403).json({ error: "Você não tem permissão para gerenciar esta funcionalidade." });
      }

      const resultado = await massDeleteUseCase.execute(entidade, ids);

      await auditoriaService.registrar({
        req,
        acao: "EXCLUIR",
        recurso: entidadeRecursoMap[entidade] ?? "SISTEMA",
        descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} excluiu em massa ${resultado.count} registro(s) em '${entidade}'.`,
        dadosNovos: { idsAfetados: ids, count: resultado.count },
      });

      return res.json({ success: true, count: resultado.count });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  acaoMassaUpdate = async (req: Request, res: Response) => {
    try {
      const { entidade, ids, status } = MassUpdateSchema.parse(req.body);
      const permissaoNecessaria = entidadePermissaoMap[entidade];
      const usuario = req.usuarioAutenticado;

      if (usuario && usuario.role !== "MASTER" && (!permissaoNecessaria || !usuario.permissoes.includes(permissaoNecessaria))) {
        return res.status(403).json({ error: "Você não tem permissão para gerenciar esta funcionalidade." });
      }

      const resultado = await massUpdateUseCase.execute(entidade, ids, status);

      await auditoriaService.registrar({
        req,
        acao: "STATUS",
        recurso: entidadeRecursoMap[entidade] ?? "SISTEMA",
        descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} alterou status em massa para '${status}' de ${resultado.count} registro(s) em '${entidade}'.`,
        dadosNovos: { idsAfetados: ids, novoStatus: status, count: resultado.count },
      });

      return res.json({ success: true, count: resultado.count });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
