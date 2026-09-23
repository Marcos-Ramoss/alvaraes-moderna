import type { Categoria, Evento } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";

export class EventosRules {
  validarCategoriaEvento(categoria: Categoria | null) {
    if (!categoria || categoria.tipo !== "EVENTO" || !categoria.ativa) {
      throw new AppError("Categoria de evento invalida ou inativa.", 400);
    }
  }

  estaEncerrado(data: Date, agora = new Date()) {
    return data.getTime() < this.inicioDoDia(agora).getTime();
  }

  validarPodePublicar(
    evento: Pick<
      Evento,
      "titulo" | "categoriaId" | "data" | "local" | "organizador" | "descricao" | "entrada"
    >,
  ) {
    if (
      !evento.titulo.trim() ||
      !evento.categoriaId ||
      !evento.data ||
      !evento.local.trim() ||
      !evento.organizador.trim() ||
      !evento.descricao.trim() ||
      !evento.entrada.trim()
    ) {
      throw new AppError("Evento incompleto para publicacao.", 400);
    }
  }

  validarExclusao(evento: Evento | null) {
    if (!evento) {
      throw new AppError("Evento nao encontrado.", 404);
    }
  }

  inicioDoDia(data: Date) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  }
}
