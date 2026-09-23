import type { Contato } from "@prisma/client";
import type { ContatoResponseDto } from "./dto/contato.response.dto.js";

export class ContatosMapper {
  paraResponse(contato: Contato): ContatoResponseDto {
    return {
      id: contato.id,
      tipo: contato.tipo,
      nome: contato.nome,
      contatoResposta: contato.contatoResposta,
      ...(contato.assunto ? { assunto: contato.assunto } : {}),
      mensagem: contato.mensagem,
      status: contato.status,
      criadoEm: contato.criadoEm.toISOString(),
      alteradoEm: contato.alteradoEm.toISOString(),
    };
  }
}
