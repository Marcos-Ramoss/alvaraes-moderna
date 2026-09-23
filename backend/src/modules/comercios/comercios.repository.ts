import type { Prisma, StatusPublicacao } from "@prisma/client";
import { TipoCategoria, TipoVinculoMidia, type Midia } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

type ListarPublicosFiltros = {
  busca?: string | undefined;
  categoria?: string | undefined;
  patrocinado?: boolean | undefined;
  possuiPagina?: boolean | undefined;
  pagina: number;
  limite: number;
};

type ListarAdminFiltros = ListarPublicosFiltros & {
  status?: StatusPublicacao | undefined;
};

type ComercioComCategoria = Prisma.ComercioGetPayload<{
  include: { categoria: true };
}>;

export type ComercioComMidias = ComercioComCategoria & {
  midias: Midia[];
};

export type MidiaComercioCreateInput = Omit<
  Prisma.MidiaUncheckedCreateInput,
  "id" | "tipoVinculo" | "registroId" | "criadoEm" | "alteradoEm"
>;

export class ComerciosRepository {
  listarCategorias() {
    return prisma.categoria.findMany({
      where: { tipo: TipoCategoria.COMERCIO, ativa: true },
      orderBy: { ordem: "asc" },
    });
  }

  buscarCategoriaPorId(id: string) {
    return prisma.categoria.findUnique({ where: { id } });
  }

  buscarCategoriaPorSlug(slug: string) {
    return prisma.categoria.findUnique({
      where: {
        slug_tipo: {
          slug,
          tipo: TipoCategoria.COMERCIO,
        },
      },
    });
  }

  async buscarPorId(id: string) {
    const comercio = await prisma.comercio.findUnique({
      where: { id },
      include: { categoria: true },
    });
    if (!comercio) return null;
    return this.anexarMidias([comercio]).then((comercios) => comercios[0] ?? null);
  }

  async buscarPorSlug(slug: string) {
    const comercio = await prisma.comercio.findUnique({
      where: { slug },
      include: { categoria: true },
    });
    if (!comercio) return null;
    return this.anexarMidias([comercio]).then((comercios) => comercios[0] ?? null);
  }

  async buscarPublicadoPorSlug(slug: string) {
    const comercio = await prisma.comercio.findFirst({
      where: { slug, status: "PUBLICADO" },
      include: { categoria: true },
    });
    if (!comercio) return null;
    return this.anexarMidias([comercio]).then((comercios) => comercios[0] ?? null);
  }

  async listarPublicados(filtros: ListarPublicosFiltros) {
    const where = this.montarWhere({
      ...filtros,
      status: "PUBLICADO",
    });

    const [total, comercios] = await prisma.$transaction([
      prisma.comercio.count({ where }),
      prisma.comercio.findMany({
        where,
        include: { categoria: true },
        orderBy: [{ patrocinado: "desc" }, { nome: "asc" }],
        skip: (filtros.pagina - 1) * filtros.limite,
        take: filtros.limite,
      }),
    ]);

    const itens = await this.anexarMidias(comercios);
    return { itens, total };
  }

  async listarAdmin(filtros: ListarAdminFiltros) {
    const where = this.montarWhere(filtros);

    const [total, comercios] = await prisma.$transaction([
      prisma.comercio.count({ where }),
      prisma.comercio.findMany({
        where,
        include: { categoria: true },
        orderBy: [{ criadoEm: "desc" }],
        skip: (filtros.pagina - 1) * filtros.limite,
        take: filtros.limite,
      }),
    ]);

    const itens = await this.anexarMidias(comercios);
    return { itens, total };
  }

  criar(data: Prisma.ComercioUncheckedCreateInput, midias: MidiaComercioCreateInput[] = []) {
    return prisma.$transaction(async (tx) => {
      const comercio = await tx.comercio.create({ data, include: { categoria: true } });
      if (midias.length > 0) {
        await tx.midia.createMany({
          data: midias.map((midia) => ({
            ...midia,
            tipoVinculo: TipoVinculoMidia.COMERCIO,
            registroId: comercio.id,
          })),
        });
      }
      const midiasCriadas = await tx.midia.findMany({
        where: { tipoVinculo: TipoVinculoMidia.COMERCIO, registroId: comercio.id, ativa: true },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      });
      return { ...comercio, midias: midiasCriadas };
    });
  }

  atualizar(id: string, data: Prisma.ComercioUncheckedUpdateInput, midias?: MidiaComercioCreateInput[]) {
    return prisma.$transaction(async (tx) => {
      const comercio = await tx.comercio.update({ where: { id }, data, include: { categoria: true } });
      if (midias) {
        await tx.midia.updateMany({
          where: { tipoVinculo: TipoVinculoMidia.COMERCIO, registroId: id },
          data: { ativa: false },
        });
        if (midias.length > 0) {
          await tx.midia.createMany({
            data: midias.map((midia) => ({
              ...midia,
              tipoVinculo: TipoVinculoMidia.COMERCIO,
              registroId: id,
            })),
          });
        }
      }
      const midiasAtivas = await tx.midia.findMany({
        where: { tipoVinculo: TipoVinculoMidia.COMERCIO, registroId: id, ativa: true },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      });
      return { ...comercio, midias: midiasAtivas };
    });
  }

  excluir(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.midia.updateMany({
        where: { tipoVinculo: TipoVinculoMidia.COMERCIO, registroId: id },
        data: { ativa: false },
      });
      return tx.comercio.delete({ where: { id } });
    });
  }

  private montarWhere(filtros: ListarAdminFiltros): Prisma.ComercioWhereInput {
    return {
      ...(filtros.status ? { status: filtros.status } : {}),
      ...(filtros.patrocinado !== undefined ? { patrocinado: filtros.patrocinado } : {}),
      ...(filtros.possuiPagina !== undefined ? { possuiPagina: filtros.possuiPagina } : {}),
      ...(filtros.categoria
        ? {
            categoria: {
              slug: filtros.categoria,
              tipo: TipoCategoria.COMERCIO,
            },
          }
        : {}),
      ...(filtros.busca
        ? {
            OR: [
              { nome: { contains: filtros.busca } },
              { area: { contains: filtros.busca } },
            ],
          }
        : {}),
    };
  }

  private async anexarMidias(comercios: ComercioComCategoria[]): Promise<ComercioComMidias[]> {
    const ids = comercios.map((comercio) => comercio.id);
    if (ids.length === 0) return [];

    const midias = await prisma.midia.findMany({
      where: {
        tipoVinculo: TipoVinculoMidia.COMERCIO,
        registroId: { in: ids },
        ativa: true,
      },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
    });
    const midiasPorComercio = new Map<string, Midia[]>();
    for (const midia of midias) {
      if (!midia.registroId) continue;
      const lista = midiasPorComercio.get(midia.registroId) ?? [];
      lista.push(midia);
      midiasPorComercio.set(midia.registroId, lista);
    }
    return comercios.map((comercio) => ({
      ...comercio,
      midias: midiasPorComercio.get(comercio.id) ?? [],
    }));
  }
}
