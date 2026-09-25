import type { Midia, Prisma } from "@prisma/client";
import type { NoticiaDetalheResponseDto } from "./dto/noticia-detalhe.response.dto.js";
import type { NoticiaResumoResponseDto } from "./dto/noticia-resumo.response.dto.js";

type NoticiaComCategoria = Prisma.NoticiaGetPayload<{
  include: { categoria: true };
}> & {
  midias?: Midia[];
};

function paraArrayTexto(valor: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((item): item is string => typeof item === "string");
}

function dataIso(valor: Date | null | undefined) {
  return valor?.toISOString();
}

export class NoticiasMapper {
  paraResumo(noticia: NoticiaComCategoria): NoticiaResumoResponseDto {
    const midias = (noticia.midias ?? []).map((midia) => ({
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
    const imagemPrincipal = noticia.imagemUrl ?? imagens[0]?.url;

    return {
      id: noticia.id,
      slug: noticia.slug,
      titulo: noticia.titulo,
      resumo: noticia.resumo,
      totalLeituras: noticia.totalLeituras,
      categoria: {
        id: noticia.categoria.id,
        nome: noticia.categoria.nome,
        slug: noticia.categoria.slug,
      },
      autorNome: noticia.autorNome,
      tipoConteudo: noticia.tipoConteudo,
      status: noticia.status,
      destaque: noticia.destaque,
      demonstracao: noticia.demonstracao,
      ...(imagemPrincipal ? { imagemUrl: imagemPrincipal } : {}),
      ...(noticia.imagemAlt ? { imagemAlt: noticia.imagemAlt } : {}),
      ...(noticia.imagemCredito ? { imagemCredito: noticia.imagemCredito } : {}),
      ...(imagens.length > 0 ? { imagens } : {}),
      ...(video ? { video } : {}),
      ...(noticia.publicadoEm ? { publicadoEm: dataIso(noticia.publicadoEm) } : {}),
      criadoEm: noticia.criadoEm.toISOString(),
      alteradoEm: noticia.alteradoEm.toISOString(),
    };
  }

  paraDetalhe(noticia: NoticiaComCategoria): NoticiaDetalheResponseDto {
    return {
      ...this.paraResumo(noticia),
      corpo: paraArrayTexto(noticia.corpo),
      fontes: paraArrayTexto(noticia.fontes),
    };
  }
}
