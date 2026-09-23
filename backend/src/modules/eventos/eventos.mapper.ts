import type { Midia, Prisma } from "@prisma/client";
import type { EventoDetalheResponseDto } from "./dto/evento-detalhe.response.dto.js";
import type { EventoResumoResponseDto } from "./dto/evento-resumo.response.dto.js";
import { EventosRules } from "./eventos.rules.js";

type EventoComCategoria = Prisma.EventoGetPayload<{
  include: { categoria: true };
}> & { midias?: Midia[] };

export class EventosMapper {
  constructor(private readonly eventosRules = new EventosRules()) {}

  paraResumo(evento: EventoComCategoria): EventoResumoResponseDto {
    const midias = (evento.midias ?? []).map((midia) => ({
      id: midia.id,
      tipoMidia: midia.tipoMidia,
      url: midia.url,
      ...(midia.titulo ? { titulo: midia.titulo } : {}),
      ...(midia.textoAlternativo ? { textoAlternativo: midia.textoAlternativo } : {}),
      ...(midia.credito ? { credito: midia.credito } : {}),
      ...(midia.origem ? { origem: midia.origem } : {}),
      ...(midia.tamanhoBytes ? { tamanhoBytes: midia.tamanhoBytes } : {}),
      ...(midia.duracaoSegundos ? { duracaoSegundos: midia.duracaoSegundos } : {}),
      ordem: midia.ordem,
    }));
    const imagens = midias.filter((midia) => midia.tipoMidia === "IMAGEM");
    const video = midias.find((midia) => midia.tipoMidia === "VIDEO");

    return {
      id: evento.id,
      titulo: evento.titulo,
      categoria: {
        id: evento.categoria.id,
        nome: evento.categoria.nome,
        slug: evento.categoria.slug,
      },
      data: evento.data.toISOString(),
      ...(evento.horario ? { horario: evento.horario } : {}),
      local: evento.local,
      organizador: evento.organizador,
      entrada: evento.entrada,
      ...(imagens.length > 0 ? { imagens } : {}),
      ...(video ? { video } : {}),
      demonstracao: evento.demonstracao,
      status: evento.status,
      encerrado: this.eventosRules.estaEncerrado(evento.data),
      criadoEm: evento.criadoEm.toISOString(),
      alteradoEm: evento.alteradoEm.toISOString(),
    };
  }

  paraDetalhe(evento: EventoComCategoria): EventoDetalheResponseDto {
    return {
      ...this.paraResumo(evento),
      descricao: evento.descricao,
      ...(evento.contato ? { contato: evento.contato } : {}),
      ...(evento.fonte ? { fonte: evento.fonte } : {}),
    };
  }
}
