import type { Midia, Prisma } from "@prisma/client";
import type { OportunidadeDetalheResponseDto } from "./dto/oportunidade-detalhe.response.dto.js";
import type { OportunidadeResumoResponseDto } from "./dto/oportunidade-resumo.response.dto.js";
import { OportunidadesRules } from "./oportunidades.rules.js";

type OportunidadeComCategoria = Prisma.OportunidadeGetPayload<{
  include: { categoria: true };
}> & { midias?: Midia[] };

export class OportunidadesMapper {
  constructor(private readonly oportunidadesRules = new OportunidadesRules()) {}

  paraResumo(oportunidade: OportunidadeComCategoria): OportunidadeResumoResponseDto {
    const encerrada = this.oportunidadesRules.estaEncerrada(oportunidade.prazo);
    const midias = (oportunidade.midias ?? []).map((midia) => ({
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
      id: oportunidade.id,
      titulo: oportunidade.titulo,
      ...(oportunidade.categoria ? { categoria: { id: oportunidade.categoria.id, nome: oportunidade.categoria.nome, slug: oportunidade.categoria.slug } } : {}),
      organizador: oportunidade.organizador,
      modalidade: oportunidade.modalidade,
      ...(oportunidade.local ? { local: oportunidade.local } : {}),
      prazo: oportunidade.prazo.toISOString(),
      ...(oportunidade.custo ? { custo: oportunidade.custo } : {}),
      ...(!encerrada && oportunidade.linkInscricao
        ? { linkInscricao: oportunidade.linkInscricao }
        : {}),
      ...(imagens.length > 0 ? { imagens } : {}),
      ...(video ? { video } : {}),
      demonstracao: oportunidade.demonstracao,
      status: oportunidade.status,
      encerrada,
      criadoEm: oportunidade.criadoEm.toISOString(),
      alteradoEm: oportunidade.alteradoEm.toISOString(),
    };
  }

  paraDetalhe(oportunidade: OportunidadeComCategoria): OportunidadeDetalheResponseDto {
    return {
      ...this.paraResumo(oportunidade),
      ...(oportunidade.requisitos ? { requisitos: oportunidade.requisitos } : {}),
    };
  }
}
