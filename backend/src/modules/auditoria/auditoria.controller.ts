import type { Request, Response } from "express";
import { auditoriaService } from "./auditoria.service.js";
import type { ListarAuditoriaQueryDto } from "./dto/listar-auditoria.query.dto.js";
import type {
  ContarAuditoriaAntigosQueryDto,
  ExpurgarAuditoriaBodyDto,
  LogAuditoriaIdParamsDto,
} from "./dto/expurgar-auditoria.dto.js";

export class AuditoriaController {
  listar = async (req: Request, res: Response) => {
    const filtros = (req.dadosValidados?.query ?? req.query) as ListarAuditoriaQueryDto;
    const { itens, total } = await auditoriaService.listar(filtros);
    const pagina = filtros.pagina ?? 1;
    const limite = filtros.limite ?? 30;
    const totalPaginas = Math.ceil(total / limite) || 1;
    return res.json({ dados: itens, total, pagina, limite, totalPaginas });
  };

  excluir = async (req: Request, res: Response) => {
    const params = (req.dadosValidados?.params ?? req.params) as LogAuditoriaIdParamsDto;
    const resultado = await auditoriaService.excluirPorId(params.id, req);
    return res.json({ dados: resultado });
  };

  contarAntigos = async (req: Request, res: Response) => {
    const query = (req.dadosValidados?.query ?? req.query) as ContarAuditoriaAntigosQueryDto;
    const resultado = await auditoriaService.contarAntigos(query.dataLimite);
    return res.json({ dados: resultado });
  };

  excluirAntigos = async (req: Request, res: Response) => {
    const body = (req.dadosValidados?.body ?? req.body) as ExpurgarAuditoriaBodyDto;
    const resultado = await auditoriaService.excluirAntigos(body.dataLimite, req);
    return res.json({ dados: resultado });
  };
}
