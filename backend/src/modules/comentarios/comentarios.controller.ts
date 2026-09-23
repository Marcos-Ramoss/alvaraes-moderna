import type { Request, Response } from "express";
import { CreateComentarioSchema } from "./dto/create-comentario.dto.js";
import { UpdateStatusComentarioSchema } from "./dto/update-status.dto.js";
import { createComentarioUseCase } from "./use-cases/create-comentario.use-case.js";
import { listComentariosPublicUseCase } from "./use-cases/list-comentarios-public.use-case.js";
import { listComentariosAdminUseCase, updateComentarioStatusUseCase, deleteComentarioUseCase } from "./use-cases/admin-comentarios.use-case.js";
import type { TipoEntidade, StatusComentario } from "@prisma/client";

export class ComentariosController {
  // Public
  async criar(req: Request, res: Response) {
    const dadosLimpados = CreateComentarioSchema.parse(req.body);
    const resultado = await createComentarioUseCase.execute(dadosLimpados);
    res.status(201).json({ mensagem: "Comentario enviado para avaliacao", id: resultado.id });
  }

  async listarPublico(req: Request, res: Response) {
    const tipo = req.params.tipo as string;
    const id = req.params.id as string;
    const resultado = await listComentariosPublicUseCase.execute(tipo as TipoEntidade, id);
    res.json(resultado);
  }

  // Admin
  async listarAdmin(req: Request, res: Response) {
    const limite = parseInt(req.query.limite as string) || 50;
    const pagina = parseInt(req.query.pagina as string) || 1;
    const status = req.query.status as StatusComentario | undefined;

    const resultado = await listComentariosAdminUseCase.execute(limite, pagina, status);
    res.json(resultado);
  }

  async atualizarStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status } = UpdateStatusComentarioSchema.parse(req.body);
    const resultado = await updateComentarioStatusUseCase.execute(id, status);
    res.json(resultado);
  }

  async remover(req: Request, res: Response) {
    const id = req.params.id as string;
    await deleteComentarioUseCase.execute(id);
    res.status(204).send();
  }
}

export const comentariosController = new ComentariosController();

