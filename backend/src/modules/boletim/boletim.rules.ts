import type { InscritoBoletim } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";

export class BoletimRules {
  validarNovoInscrito(inscritoExistente: InscritoBoletim | null) {
    if (inscritoExistente?.ativo) {
      throw new AppError("Este e-mail ja esta inscrito no boletim.", 409);
    }
  }

  validarInscritoEncontrado(inscrito: InscritoBoletim | null) {
    if (!inscrito || !inscrito.ativo) throw new AppError("Inscrito nao encontrado.", 404);
  }

  calcularPeriodoDaSemana(referencia = new Date()) {
    const inicio = new Date(referencia);
    const diaSemana = inicio.getDay();
    const diasDesdeSexta = (diaSemana + 2) % 7;

    inicio.setDate(inicio.getDate() - diasDesdeSexta);
    inicio.setHours(18, 0, 0, 0);

    if (referencia < inicio) {
      inicio.setDate(inicio.getDate() - 7);
    }

    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 7);
    fim.setMilliseconds(fim.getMilliseconds() - 1);

    return { inicio, fim };
  }

  calcularPeriodoProximosDias(referencia = new Date()) {
    const inicio = new Date(referencia);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 7);
    fim.setHours(23, 59, 59, 999);

    return { inicio, fim };
  }
}
