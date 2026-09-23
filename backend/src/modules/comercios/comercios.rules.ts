import type { Categoria, Comercio } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";

export class ComerciosRules {
  validarCategoriaComercio(categoria: Categoria | null) {
    if (!categoria || categoria.tipo !== "COMERCIO" || !categoria.ativa) {
      throw new AppError("Categoria de comercio invalida ou inativa.", 400);
    }
  }

  validarSlugDisponivel(comercioExistente: Comercio | null, comercioIdAtual?: string) {
    if (comercioExistente && comercioExistente.id !== comercioIdAtual) {
      throw new AppError("Ja existe um comercio com este slug.", 409);
    }
  }

  validarPodePublicar(comercio: Pick<Comercio, "nome" | "categoriaId" | "area">) {
    if (!comercio.nome.trim() || !comercio.categoriaId || !comercio.area.trim()) {
      throw new AppError("Comercio incompleto para publicacao.", 400);
    }
  }

  validarPodeExibirPagina(comercio: Comercio | null) {
    if (!comercio) {
      throw new AppError("Comercio nao encontrado.", 404);
    }

    if (!comercio.possuiPagina) {
      throw new AppError("Este comercio nao possui pagina completa publicada.", 404);
    }
  }

  validarExclusao(comercio: Comercio | null) {
    if (!comercio) {
      throw new AppError("Comercio nao encontrado.", 404);
    }
  }
}
