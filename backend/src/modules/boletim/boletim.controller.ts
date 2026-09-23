import type { Request, Response } from "express";
import { BoletimService } from "./boletim.service.js";
import type { InscreverBoletimRequestDto } from "./dto/inscrever-boletim.request.dto.js";

type InscritoBoletimIdParams = { id: string };

export class BoletimController {
  constructor(private readonly boletimService = new BoletimService()) {}

  montarPreviaSemanal = async (_req: Request, res: Response) => {
    const previa = await this.boletimService.montarPreviaSemanal();
    return res.json({ dados: previa });
  };

  inscrever = async (req: Request, res: Response) => {
    const body = req.dadosValidados?.body as InscreverBoletimRequestDto;
    const resultado = await this.boletimService.inscrever(body);
    return res.status(201).json(resultado);
  };

  listarInscritos = async (_req: Request, res: Response) => {
    const inscritos = await this.boletimService.listarInscritos();
    return res.json({ dados: inscritos });
  };

  removerInscrito = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as InscritoBoletimIdParams;
    const resultado = await this.boletimService.removerInscrito(params.id);
    return res.json(resultado);
  };
}
