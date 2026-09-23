import type { Request, Response } from "express";
import type { AtualizarStatusContatoRequestDto } from "./dto/atualizar-status-contato.request.dto.js";
import type { CriarContatoRequestDto } from "./dto/criar-contato.request.dto.js";
import { ContatosService } from "./contatos.service.js";

type ContatoIdParams = { id: string };

export class ContatosController {
  constructor(private readonly contatosService = new ContatosService()) {}

  criarContato = async (req: Request, res: Response) => {
    const body = req.dadosValidados?.body as CriarContatoRequestDto;
    const resultado = await this.contatosService.criarContato(body);
    return res.status(201).json(resultado);
  };

  listarContatos = async (_req: Request, res: Response) => {
    const contatos = await this.contatosService.listarContatos();
    return res.json({ dados: contatos });
  };

  atualizarStatus = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as ContatoIdParams;
    const body = req.dadosValidados?.body as AtualizarStatusContatoRequestDto;
    const contato = await this.contatosService.atualizarStatus(params.id, body);
    return res.json({ dados: contato });
  };
}
