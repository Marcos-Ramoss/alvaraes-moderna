import type { Evento, InscritoBoletim, Noticia, Oportunidade } from "@prisma/client";
import type { InscritoBoletimResponseDto } from "./dto/inscrito-boletim.response.dto.js";
import type { PreviaBoletimResponseDto } from "./dto/previa-boletim.response.dto.js";

export class BoletimMapper {
  paraInscrito(inscrito: InscritoBoletim): InscritoBoletimResponseDto {
    return {
      id: inscrito.id,
      nome: inscrito.nome,
      email: inscrito.email,
      origem: inscrito.origem,
      ativo: inscrito.ativo,
      criadoEm: inscrito.criadoEm.toISOString(),
      alteradoEm: inscrito.alteradoEm.toISOString(),
    };
  }

  paraPrevia(params: {
    periodo: { inicio: Date; fim: Date };
    contagemInscritos: number;
    noticiasDaSemana: Noticia[];
    agendaProximosDias: Evento[];
    inscricoesAbertas: Oportunidade[];
  }): PreviaBoletimResponseDto {
    return {
      titulo: "Boa semana, Alvarães!",
      saudacao: "Aqui vai o resumo do que aconteceu na cidade e o que vem por aí.",
      periodo: {
        inicio: params.periodo.inicio.toISOString(),
        fim: params.periodo.fim.toISOString(),
      },
      contagemInscritos: params.contagemInscritos,
      noticiasDaSemana: params.noticiasDaSemana.map((noticia) => ({
        id: noticia.id,
        slug: noticia.slug,
        titulo: noticia.titulo,
        resumo: noticia.resumo,
        publicadoEm: (noticia.publicadoEm ?? noticia.criadoEm).toISOString(),
      })),
      agendaProximosDias: params.agendaProximosDias.map((evento) => ({
        id: evento.id,
        titulo: evento.titulo,
        data: evento.data.toISOString(),
        ...(evento.horario ? { horario: evento.horario } : {}),
        local: evento.local,
      })),
      inscricoesAbertas: params.inscricoesAbertas.map((oportunidade) => ({
        id: oportunidade.id,
        titulo: oportunidade.titulo,
        organizador: oportunidade.organizador,
        prazo: oportunidade.prazo.toISOString(),
      })),
    };
  }
}
