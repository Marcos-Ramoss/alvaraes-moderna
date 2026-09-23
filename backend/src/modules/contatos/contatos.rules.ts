import type { Contato } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";

export class ContatosRules {
  validarEncontrado(contato: Contato | null) {
    if (!contato) throw new AppError("Contato nao encontrado.", 404);
  }
}
