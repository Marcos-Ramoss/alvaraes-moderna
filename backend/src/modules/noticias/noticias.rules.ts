import type { Categoria, Noticia, Prisma } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";

export class NoticiasRules {
  validarCategoriaNoticia(categoria: Categoria | null) {
    if (!categoria || categoria.tipo !== "NOTICIA" || !categoria.ativa) {
      throw new AppError("Categoria de noticia invalida ou inativa.", 400);
    }
  }

  validarSlugDisponivel(noticiaExistente: Noticia | null, noticiaIdAtual?: string) {
    if (noticiaExistente && noticiaExistente.id !== noticiaIdAtual) {
      throw new AppError("Ja existe uma noticia com este slug.", 409);
    }
  }

  validarPodePublicar(noticia: {
    titulo: string;
    resumo: string;
    corpo: Prisma.JsonValue | string[];
    categoriaId: string;
  }) {
    if (!noticia.titulo.trim() || !noticia.resumo.trim() || !noticia.categoriaId) {
      throw new AppError("Noticia incompleta para publicacao.", 400);
    }

    if (!Array.isArray(noticia.corpo) || noticia.corpo.length === 0) {
      throw new AppError("Noticia precisa ter corpo para ser publicada.", 400);
    }
  }

  validarExclusao(noticia: Noticia | null) {
    if (!noticia) {
      throw new AppError("Noticia nao encontrada.", 404);
    }
  }
}
