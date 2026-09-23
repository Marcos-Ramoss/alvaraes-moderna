import { comentariosRepository } from "../comentarios.repository.js";
import type { TipoEntidade } from "@prisma/client";

export class ListComentariosPublicUseCase {
  async execute(entidadeTipo: TipoEntidade, entidadeId: string) {
    const comentarios = await comentariosRepository.listarAprovadosPorEntidade(entidadeTipo, entidadeId);
    const total = await comentariosRepository.contarAprovados(entidadeTipo, entidadeId);
    
    // Nao retornar e-mail para frontend publico
    return {
      total,
      items: comentarios.map(c => ({
        id: c.id,
        autorNome: c.autorNome,
        conteudo: c.conteudo,
        criadoEm: c.criadoEm,
      }))
    };
  }
}

export const listComentariosPublicUseCase = new ListComentariosPublicUseCase();

