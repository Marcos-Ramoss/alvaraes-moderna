import type { Request, Response } from "express";
import { ToggleCurtidaSchema } from "./dto/toggle-curtida.dto.js";
import { toggleCurtidaUseCase } from "./use-cases/toggle-curtida.use-case.js";
import { getCurtidasUseCase } from "./use-cases/get-curtidas.use-case.js";
import type { TipoEntidade } from "@prisma/client";

export class CurtidasController {
  async toggle(req: Request, res: Response) {
    const dadosLimpados = ToggleCurtidaSchema.parse(req.body);
    const resultado = await toggleCurtidaUseCase.execute(dadosLimpados);
    res.json(resultado);
  }

  async getContagem(req: Request, res: Response) {
    const tipo = req.params.tipo as string;
    const id = req.params.id as string;
    const { clienteId } = req.query;

    const resultado = await getCurtidasUseCase.execute(
      tipo as TipoEntidade,
      id,
      clienteId as string | undefined
    );
    
    res.json(resultado);
  }
}

export const curtidasController = new CurtidasController();

