import type { Midia, Prisma } from "@prisma/client";
import type { ComercioDetalheResponseDto } from "./dto/comercio-detalhe.response.dto.js";
import type {
  ComercioResumoResponseDto,
  RedeSocialResponseDto,
} from "./dto/comercio-resumo.response.dto.js";

type ComercioComCategoria = Prisma.ComercioGetPayload<{
  include: { categoria: true };
}> & { midias?: Midia[] };

function paraArrayTexto(valor: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((item): item is string => typeof item === "string");
}

function paraRedesSociais(valor: Prisma.JsonValue | null): RedeSocialResponseDto[] {
  if (!Array.isArray(valor)) return [];

  return valor.filter((item): item is RedeSocialResponseDto => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    return "label" in item && "url" in item;
  });
}

export class ComerciosMapper {
  paraResumo(comercio: ComercioComCategoria): ComercioResumoResponseDto {
    const midias = (comercio.midias ?? []).map((midia) => ({
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
      id: comercio.id,
      slug: comercio.slug,
      nome: comercio.nome,
      categoria: {
        id: comercio.categoria.id,
        nome: comercio.categoria.nome,
        slug: comercio.categoria.slug,
      },
      area: comercio.area,
      ...(comercio.telefone ? { telefone: comercio.telefone } : {}),
      ...(comercio.whatsapp ? { whatsapp: comercio.whatsapp } : {}),
      ...(comercio.siteExterno ? { siteExterno: comercio.siteExterno } : {}),
      ...(imagens.length > 0 ? { imagens } : {}),
      ...(video ? { video } : {}),
      possuiPagina: comercio.possuiPagina,
      patrocinado: comercio.patrocinado,
      demonstracao: comercio.demonstracao,
      status: comercio.status,
      criadoEm: comercio.criadoEm.toISOString(),
      alteradoEm: comercio.alteradoEm.toISOString(),
    };
  }

  paraDetalhe(comercio: ComercioComCategoria): ComercioDetalheResponseDto {
    return {
      ...this.paraResumo(comercio),
      ...(comercio.descricao ? { descricao: comercio.descricao } : {}),
      servicos: paraArrayTexto(comercio.servicos),
      horarios: paraArrayTexto(comercio.horarios),
      ...(comercio.endereco ? { endereco: comercio.endereco } : {}),
      redesSociais: paraRedesSociais(comercio.redesSociais),
    };
  }
}
