import { curtidasRepository } from "../curtidas.repository.js";
import type { ToggleCurtidaInput } from "../dto/toggle-curtida.dto.js";

export class ToggleCurtidaUseCase {
  async execute(input: ToggleCurtidaInput) {
    const curtidaExistente = await curtidasRepository.encontrarPorClienteEEntidade(
      input.entidadeTipo,
      input.entidadeId,
      input.clienteId
    );

    if (curtidaExistente) {
      await curtidasRepository.remover(curtidaExistente.id);
      return { curtido: false };
    } else {
      await curtidasRepository.adicionar(input.entidadeTipo, input.entidadeId, input.clienteId);
      return { curtido: true };
    }
  }
}

export const toggleCurtidaUseCase = new ToggleCurtidaUseCase();

