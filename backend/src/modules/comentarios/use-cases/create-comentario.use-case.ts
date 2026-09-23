import { comentariosRepository } from "../comentarios.repository.js";
import type { CreateComentarioInput } from "../dto/create-comentario.dto.js";

export class CreateComentarioUseCase {
  async execute(input: CreateComentarioInput) {
    const comentario = await comentariosRepository.criar(input);
    return comentario;
  }
}

export const createComentarioUseCase = new CreateComentarioUseCase();

