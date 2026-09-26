import type { Request, Response } from "express";
import { auditoriaService } from "./auditoria.service.js";
import type { ListarAuditoriaQueryDto } from "./dto/listar-auditoria.query.dto.js";

export class AuditoriaController {
  listar = async (req: Request, res: Response) => {
    const filtros = (req.dadosValidados?.query ?? req.query) as ListarAuditoriaQueryDto;
    const { itens, total } = await auditoriaService.listar(filtros);
    return res.json({ dados: itens, total });
  };
}
