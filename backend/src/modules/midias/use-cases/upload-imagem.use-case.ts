import crypto from "node:crypto";
import path from "node:path";
import { env } from "../../../config/env.js";
import { supabase } from "../../../config/supabase.js";
import {
  ArquivoExcedeTamanhoMaximoError,
  ArquivoNaoEnviadoError,
  FalhaUploadStorageError,
  TipoArquivoInvalidoError,
} from "../errors/midia.errors.js";

export const TIPOS_IMAGEM_PERMITIDOS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const LIMITE_PADRAO_IMAGEM_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ArquivoUploadInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface UploadImagemResultado {
  url: string;
  caminho: string;
  nomeOriginal: string;
  tamanhoBytes: number;
  tipoMime: string;
}

export class UploadImagemUseCase {
  async executar(
    arquivo?: ArquivoUploadInput,
    pasta = "geral",
  ): Promise<UploadImagemResultado> {
    this.validarArquivo(arquivo);

    const caminhoArquivo = this.gerarCaminhoDestino(arquivo.originalname, pasta);

    const { error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(caminhoArquivo, arquivo.buffer, {
        contentType: arquivo.mimetype,
        upsert: false,
      });

    if (error) {
      throw new FalhaUploadStorageError(error.message);
    }

    const { data: dadosUrl } = supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(caminhoArquivo);

    return {
      url: dadosUrl.publicUrl,
      caminho: caminhoArquivo,
      nomeOriginal: arquivo.originalname,
      tamanhoBytes: arquivo.size,
      tipoMime: arquivo.mimetype,
    };
  }

  private validarArquivo(arquivo?: ArquivoUploadInput): asserts arquivo is ArquivoUploadInput {
    if (!arquivo || !arquivo.buffer) {
      throw new ArquivoNaoEnviadoError();
    }

    if (!TIPOS_IMAGEM_PERMITIDOS.includes(arquivo.mimetype.toLowerCase() as any)) {
      throw new TipoArquivoInvalidoError(arquivo.mimetype);
    }

    if (arquivo.size > LIMITE_PADRAO_IMAGEM_BYTES) {
      throw new ArquivoExcedeTamanhoMaximoError(LIMITE_PADRAO_IMAGEM_BYTES);
    }
  }

  private gerarCaminhoDestino(nomeOriginal: string, pasta: string): string {
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");

    const extensao = path.extname(nomeOriginal).toLowerCase();
    const identificadorUnico = crypto.randomUUID().slice(0, 8);
    const nomeBase = path
      .basename(nomeOriginal, extensao)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 30);

    const pastaLimpa = pasta.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    return `${pastaLimpa}/${ano}/${mes}/${Date.now()}-${identificadorUnico}-${nomeBase}${extensao}`;
  }
}

