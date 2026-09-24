import { AppError } from "../../../common/errors/app-error.js";

export class ArquivoNaoEnviadoError extends AppError {
  constructor() {
    super("Nenhum arquivo de imagem foi enviado.", 400);
  }
}

export class TipoArquivoInvalidoError extends AppError {
  constructor(tipoRecebido: string) {
    super(
      `Tipo de arquivo '${tipoRecebido}' nao permitido. Envie apenas imagens (JPEG, PNG, WebP, GIF ou AVIF).`,
      400,
    );
  }
}

export class ArquivoExcedeTamanhoMaximoError extends AppError {
  constructor(limiteBytes: number) {
    const limiteMb = Math.round(limiteBytes / (1024 * 1024));
    super(`O arquivo excede o tamanho maximo permitido de ${limiteMb} MB.`, 400);
  }
}

export class FalhaUploadStorageError extends AppError {
  constructor(detalhes?: string) {
    super(
      detalhes
        ? `Falha ao salvar imagem no servidor de armazenamento: ${detalhes}`
        : "Falha ao salvar imagem no servidor de armazenamento.",
      502,
    );
  }
}

