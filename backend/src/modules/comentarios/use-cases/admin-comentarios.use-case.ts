import { comentariosRepository } from "../comentarios.repository.js";
import type { StatusComentario } from "@prisma/client";

export class ListComentariosAdminUseCase {
  async execute(limite: number, pagina: number, status?: StatusComentario) {
    return comentariosRepository.listarTodosAdmin(limite, pagina, status);
  }
}

export class UpdateComentarioStatusUseCase {
  async execute(id: string, status: StatusComentario) {
    return comentariosRepository.atualizarStatus(id, status);
  }
}

export class DeleteComentarioUseCase {
  async execute(id: string) {
    return comentariosRepository.remover(id);
  }
}

export const listComentariosAdminUseCase = new ListComentariosAdminUseCase();
export const updateComentarioStatusUseCase = new UpdateComentarioStatusUseCase();
export const deleteComentarioUseCase = new DeleteComentarioUseCase();

