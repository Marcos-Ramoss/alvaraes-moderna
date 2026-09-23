import { prisma } from "../../../database/prisma.js";
import { TipoEntidade, TipoVinculoMidia } from "@prisma/client";

export class MassDeleteUseCase {
  async execute(entidade: string, ids: string[]) {
    // Apaga relações polimórficas (Mídias, Comentários, Curtidas)
    if (["NOTICIA", "COMERCIO", "EVENTO", "CURSO"].includes(entidade)) {
      const tipoEntidadeMap: Record<string, TipoEntidade> = {
        NOTICIA: TipoEntidade.NOTICIA,
        COMERCIO: TipoEntidade.COMERCIO,
        EVENTO: TipoEntidade.EVENTO,
        CURSO: TipoEntidade.CURSO,
      };

      const tipoVinculoMap: Record<string, TipoVinculoMidia> = {
        NOTICIA: TipoVinculoMidia.NOTICIA,
        COMERCIO: TipoVinculoMidia.COMERCIO,
        EVENTO: TipoVinculoMidia.EVENTO,
        CURSO: TipoVinculoMidia.OPORTUNIDADE, // Cursos/Oportunidades mapeiam para OPORTUNIDADE no vínculo da mídia
      };

      const tipoVinculo = tipoVinculoMap[entidade] as TipoVinculoMidia;
      const tipoEntidade = tipoEntidadeMap[entidade] as TipoEntidade;

      await prisma.midia.deleteMany({
        where: {
          tipoVinculo: tipoVinculo,
          registroId: { in: ids },
        },
      });

      await prisma.comentario.deleteMany({
        where: {
          entidadeTipo: tipoEntidade,
          entidadeId: { in: ids },
        },
      });

      await prisma.curtida.deleteMany({
        where: {
          entidadeTipo: tipoEntidade,
          entidadeId: { in: ids },
        },
      });
    }

    // Apaga as entidades em si
    switch (entidade) {
      case "NOTICIA":
        return prisma.noticia.deleteMany({ where: { id: { in: ids } } });
      case "COMERCIO":
        return prisma.comercio.deleteMany({ where: { id: { in: ids } } });
      case "EVENTO":
        return prisma.evento.deleteMany({ where: { id: { in: ids } } });
      case "CURSO":
        return prisma.oportunidade.deleteMany({ where: { id: { in: ids } } });
      case "COMENTARIO":
        return prisma.comentario.deleteMany({ where: { id: { in: ids } } });
      case "CONTATO":
        return prisma.contato.deleteMany({ where: { id: { in: ids } } });
      case "PEDIDO_ANUNCIO":
        return prisma.pedidoAnuncio.deleteMany({ where: { id: { in: ids } } });
      default:
        throw new Error("Entidade não suportada para exclusão em massa.");
    }
  }
}

