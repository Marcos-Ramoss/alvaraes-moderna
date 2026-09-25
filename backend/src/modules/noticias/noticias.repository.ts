import type { Midia, Prisma, StatusPublicacao } from "@prisma/client";
import { TipoCategoria, TipoVinculoMidia } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import { AppError } from "../../common/errors/app-error.js";

type ListarPublicasFiltros = {
  busca?: string | undefined;
  categoria?: string | undefined;
  destaque?: boolean | undefined;
  ordenacao?: "MAIS_RECENTES" | "MAIS_ANTIGAS" | "MAIS_LIDAS";
  pagina: number;
  limite: number;
};

type ListarAdminFiltros = ListarPublicasFiltros & {
  status?: StatusPublicacao | undefined;
};

type NoticiaComCategoria = Prisma.NoticiaGetPayload<{
  include: { categoria: true };
}>;

export type NoticiaComMidias = NoticiaComCategoria & {
  totalCurtidas?: number;
  totalComentarios?: number;
  midias: Midia[];
};

export type MidiaNoticiaCreateInput = Omit<
  Prisma.MidiaUncheckedCreateInput,
  "id" | "tipoVinculo" | "registroId" | "criadoEm" | "alteradoEm"
>;

export class NoticiasRepository {
  buscarCategoriaPorId(id: string) {
    return prisma.categoria.findUnique({ where: { id } });
  }

  buscarCategoriaPorSlug(slug: string) {
    return prisma.categoria.findUnique({
      where: {
        slug_tipo: {
          slug,
          tipo: TipoCategoria.NOTICIA,
        },
      },
    });
  }

  listarCategorias() {
    return prisma.categoria.findMany({
      where: { tipo: TipoCategoria.NOTICIA, ativa: true },
      orderBy: { ordem: "asc" },
    });
  }

  async buscarPorId(id: string) {
    const noticia = await prisma.noticia.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!noticia) return null;
    return this.anexarMidias([noticia]).then((noticias) => noticias[0] ?? null);
  }

  async buscarPorSlug(slug: string) {
    const noticia = await prisma.noticia.findUnique({
      where: { slug },
      include: { categoria: true },
    });

    if (!noticia) return null;
    return this.anexarMidias([noticia]).then((noticias) => noticias[0] ?? null);
  }

  async buscarPublicaPorSlug(slug: string) {
    const noticia = await prisma.noticia.findFirst({
      where: { slug, status: "PUBLICADO" },
      include: { categoria: true },
    });

    if (!noticia) return null;
    return this.anexarMidias([noticia]).then((noticias) => noticias[0] ?? null);
  }

  async listarPublicas(filtros: ListarPublicasFiltros) {
    const where = this.montarWhere({
      ...filtros,
      status: "PUBLICADO",
    });

    if (filtros.ordenacao === "MAIS_LIDAS") where.totalLeituras = { gt: 0 };
    const ordem: Prisma.NoticiaOrderByWithRelationInput[] = filtros.ordenacao === "MAIS_LIDAS"
      ? [{ totalLeituras: "desc" }, { publicadoEm: "desc" }, { id: "asc" }]
      : [{ publicadoEm: filtros.ordenacao === "MAIS_ANTIGAS" ? "asc" : "desc" }, { id: "asc" }];

    const [total, noticias] = await prisma.$transaction([
      prisma.noticia.count({ where }),
      prisma.noticia.findMany({
        where,
        include: { categoria: true },
        orderBy: ordem,
        skip: (filtros.pagina - 1) * filtros.limite,
        take: filtros.limite,
      })
    ]);

    const itens = await this.anexarMidias(noticias);
    return { itens, total };
  }

  async registrarLeitura(slug: string, clienteHash: string, dia: Date) {
    return prisma.$transaction(async (tx) => {
      const noticia = await tx.noticia.findFirst({ where: { slug, status: "PUBLICADO" }, select: { id: true } });
      if (!noticia) throw new AppError("Notícia não encontrada.", 404);

      // A chave única e o incremento na mesma transação evitam contar requisições concorrentes duas vezes.
      const leitura = await tx.leituraNoticia.createMany({
        data: [{ noticiaId: noticia.id, clienteHash, dia }], skipDuplicates: true,
      });
      if (leitura.count === 0) return { registrada: false };
      // A leitura não é uma edição editorial: mantenha alterado_em intacto.
      const atualizada = await tx.$executeRaw`
        UPDATE "noticias" SET "total_leituras" = "total_leituras" + 1
        WHERE "id" = ${noticia.id} AND "status" = 'PUBLICADO'
      `;
      if (atualizada === 0) throw new AppError("Notícia não encontrada.", 404);
      await tx.leituraNoticia.deleteMany({ where: { noticiaId: noticia.id, dia: { lt: dia } } });
      return { registrada: true };
    });
  }

  async listarAdmin(filtros: ListarAdminFiltros) {
    const where = this.montarWhere(filtros);
    const [total, noticias] = await prisma.$transaction([
      prisma.noticia.count({ where }),
      prisma.noticia.findMany({
        where,
        include: { categoria: true },
        orderBy: [{ criadoEm: "desc" }],
        skip: (filtros.pagina - 1) * filtros.limite,
        take: filtros.limite,
      })
    ]);

    const itens = await this.anexarMidias(noticias);
    return { itens, total };
  }

  criar(data: Prisma.NoticiaUncheckedCreateInput, midias: MidiaNoticiaCreateInput[] = []) {
    return prisma.$transaction(async (tx) => {
      const noticia = await tx.noticia.create({
        data,
        include: { categoria: true },
      });

      if (midias.length > 0) {
        await tx.midia.createMany({
          data: midias.map((midia) => ({
            ...midia,
            tipoVinculo: TipoVinculoMidia.NOTICIA,
            registroId: noticia.id,
          })),
        });
      }

      const midiasCriadas = await tx.midia.findMany({
        where: {
          tipoVinculo: TipoVinculoMidia.NOTICIA,
          registroId: noticia.id,
          ativa: true,
        },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      });

      return { ...noticia, midias: midiasCriadas };
    });
  }

  atualizar(
    id: string,
    data: Prisma.NoticiaUncheckedUpdateInput,
    midias?: MidiaNoticiaCreateInput[],
  ) {
    return prisma.$transaction(async (tx) => {
      const noticia = await tx.noticia.update({
        where: { id },
        data,
        include: { categoria: true },
      });

      if (midias) {
        await tx.midia.updateMany({
          where: {
            tipoVinculo: TipoVinculoMidia.NOTICIA,
            registroId: id,
          },
          data: { ativa: false },
        });

        if (midias.length > 0) {
          await tx.midia.createMany({
            data: midias.map((midia) => ({
              ...midia,
              tipoVinculo: TipoVinculoMidia.NOTICIA,
              registroId: id,
            })),
          });
        }
      }

      const midiasAtivas = await tx.midia.findMany({
        where: {
          tipoVinculo: TipoVinculoMidia.NOTICIA,
          registroId: id,
          ativa: true,
        },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      });

      return { ...noticia, midias: midiasAtivas };
    });
  }

  excluir(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.midia.updateMany({
        where: {
          tipoVinculo: TipoVinculoMidia.NOTICIA,
          registroId: id,
        },
        data: { ativa: false },
      });

      return tx.noticia.delete({ where: { id } });
    });
  }

  private montarWhere(filtros: ListarAdminFiltros): Prisma.NoticiaWhereInput {
    return {
      ...(filtros.status ? { status: filtros.status } : {}),
      ...(filtros.destaque !== undefined ? { destaque: filtros.destaque } : {}),
      ...(filtros.categoria
        ? {
            categoria: {
              slug: filtros.categoria,
              tipo: TipoCategoria.NOTICIA,
            },
          }
        : {}),
      ...(filtros.busca
        ? {
            OR: [
              { titulo: { contains: filtros.busca, mode: "insensitive" } },
              { resumo: { contains: filtros.busca, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private async anexarMidias(noticias: NoticiaComCategoria[]): Promise<NoticiaComMidias[]> {
    const ids = noticias.map((noticia) => noticia.id);
    if (ids.length === 0) return [];

    const midias = await prisma.midia.findMany({
      where: {
        tipoVinculo: TipoVinculoMidia.NOTICIA,
        registroId: { in: ids },
        ativa: true,
      },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
    });

    const midiasPorNoticia = new Map<string, Midia[]>();
    for (const midia of midias) {
      if (!midia.registroId) continue;
      const lista = midiasPorNoticia.get(midia.registroId) ?? [];
      lista.push(midia);
      midiasPorNoticia.set(midia.registroId, lista);
    }

    return noticias.map((noticia) => ({
      ...noticia,
      midias: midiasPorNoticia.get(noticia.id) ?? [],
    }));
  }
}
