import { curtidasRepository } from "../curtidas.repository.js";
import type { TipoEntidade } from "@prisma/client";

export class GetCurtidasUseCase {
  async execute(entidadeTipo: TipoEntidade, entidadeId: string, clienteId?: string) {
    const total = await curtidasRepository.contarPorEntidade(entidadeTipo, entidadeId);
    
    let curtido = false;
    if (clienteId) {
      const curtidaExistente = await curtidasRepository.encontrarPorClienteEEntidade(entidadeTipo, entidadeId, clienteId);
      curtido = !!curtidaExistente;
    }

    return {
      total,
      curtido
    };
  }
}

export const getCurtidasUseCase = new GetCurtidasUseCase();

