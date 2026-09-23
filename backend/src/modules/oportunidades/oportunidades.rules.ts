import type { Categoria, Oportunidade } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";

export class OportunidadesRules {
  validarCategoriaOportunidade(categoria: Categoria | null) {
    if (!categoria || categoria.tipo !== "OPORTUNIDADE" || !categoria.ativa) {
      throw new AppError("Categoria de oportunidade invalida ou inativa.", 400);
    }
  }

  estaEncerrada(prazo: Date, agora = new Date()) {
    return prazo.getTime() < agora.getTime();
  }

  validarPodePublicar(
    oportunidade: Pick<Oportunidade, "titulo" | "organizador" | "modalidade" | "prazo">,
  ) {
    if (
      !oportunidade.titulo.trim() ||
      !oportunidade.organizador.trim() ||
      !oportunidade.modalidade ||
      !oportunidade.prazo
    ) {
      throw new AppError("Oportunidade incompleta para publicacao.", 400);
    }
  }

  validarExclusao(oportunidade: Oportunidade | null) {
    if (!oportunidade) {
      throw new AppError("Oportunidade nao encontrada.", 404);
    }
  }
}
