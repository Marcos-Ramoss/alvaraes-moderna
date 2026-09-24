import type { NextFunction, Request, Response } from "express";
import { UploadImagemUseCase } from "./use-cases/upload-imagem.use-case.js";

export class MidiasController {
  constructor(
    private readonly uploadImagemUseCase = new UploadImagemUseCase(),
  ) {}

  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const arquivoRecebido = this.obterArquivoDaRequisicao(req);
      const pasta = typeof req.body.pasta === "string" ? req.body.pasta : "geral";

      const resultado = await this.uploadImagemUseCase.executar(arquivoRecebido, pasta);

      res.status(201).json({
        sucesso: true,
        dados: resultado,
      });
    } catch (error) {
      next(error);
    }
  };

  private obterArquivoDaRequisicao(req: Request) {
    if (req.file) {
      return req.file;
    }

    if (req.files && !Array.isArray(req.files)) {
      const primeiro =
        req.files["arquivo"]?.[0] ??
        req.files["file"]?.[0] ??
        req.files["imagem"]?.[0];

      if (primeiro) return primeiro;
    }

    return undefined;
  }
}

