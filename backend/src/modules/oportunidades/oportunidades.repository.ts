import type { Midia, ModalidadeOportunidade, Prisma, StatusPublicacao } from "@prisma/client";
import { TipoCategoria, TipoVinculoMidia } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

type SituacaoOportunidade = "ABERTA" | "ENCERRADA" | "TODAS";

type ListarPublicosFiltros = {
  busca?: string | undefined;
  modalidade?: ModalidadeOportunidade | undefined;
  situacao: SituacaoOportunidade;
  pagina: number;
  limite: number;
};

type ListarAdminFiltros = ListarPublicosFiltros & {
  status?: StatusPublicacao | undefined;
};

type OportunidadeComCategoria = Prisma.OportunidadeGetPayload<{
  include: { categoria: true };
}>;

export type OportunidadeComMidias = OportunidadeComCategoria & {
  midias: Midia[];
};

export type MidiaOportunidadeCreateInput = Omit<
  Prisma.MidiaUncheckedCreateInput,
  "id" | "tipoVinculo" | "registroId" | "criadoEm" | "alteradoEm"
>;

export class OportunidadesRepository {
  buscarCategoriaPorId(id: string) {
    return prisma.categoria.findUnique({ where: { id } });
  }

  buscarCategoriaPorSlug(slug: string) {
    return prisma.categoria.findUnique({
      where: {
        slug_tipo: {
          slug,
          tipo: TipoCategoria.OPORTUNIDADE,
        },
      },
    });
  }

  async buscarPorId(id: string) {
    const oportunidade = await prisma.oportunidade.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!oportunidade) return null;
    return this.anexarMidias([oportunidade]).then((oportunidades) => oportunidades[0] ?? null);
  }

  listarCategorias() {
    return prisma.categoria.findMany({
      where: { tipo: TipoCategoria.OPORTUNIDADE, ativa: true },
      orderBy: { ordem: "asc" },
    });
  }

  async listarPublicadas(filtros: ListarPublicosFiltros, agora: Date) {
    const where = this.montarWhere({ ...filtros, status: "PUBLICADO" }, agora);

    const [total, oportunidades] = await prisma.$transaction([
      prisma.oportunidade.count({ where }),
      prisma.oportunidade.findMany({
        where,
        include: { categoria: true },
        orderBy: [{ prazo: "asc" }],
        skip: (filtros.pagina - 1) * filtros.limite,
        take: filtros.limite,
      }),
    ]);

    const itens = await this.anexarMidias(oportunidades);
    return { itens, total };
  }

  async listarAdmin(filtros: ListarAdminFiltros, agora: Date) {
    const where = this.montarWhere(filtros, agora);

    const [total, oportunidades] = await prisma.$transaction([
      prisma.oportunidade.count({ where }),
      prisma.oportunidade.findMany({
        where,
        include: { categoria: true },
        orderBy: [{ prazo: "asc" }],
        skip: (filtros.pagina - 1) * filtros.limite,
        take: filtros.limite,
      }),
    ]);

    const itens = await this.anexarMidias(oportunidades);
    return { itens, total };
  }

  criar(
    data: Prisma.OportunidadeUncheckedCreateInput,
    midias: MidiaOportunidadeCreateInput[] = [],
  ) {
    return prisma.$transaction(async (tx) => {
      const oportunidade = await tx.oportunidade.create({
        data,
        include: { categoria: true },
      });

      if (midias.length > 0) {
        await tx.midia.createMany({
          data: midias.map((midia) => ({
            ...midia,
            tipoVinculo: TipoVinculoMidia.OPORTUNIDADE,
            registroId: oportunidade.id,
          })),
        });
      }

      const midiasCriadas = await tx.midia.findMany({
        where: {
          tipoVinculo: TipoVinculoMidia.OPORTUNIDADE,
          registroId: oportunidade.id,
          ativa: true,
        },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      });

      return { ...oportunidade, midias: midiasCriadas };
    });
  }

  atualizar(
    id: string,
    data: Prisma.OportunidadeUncheckedUpdateInput,
    midias?: MidiaOportunidadeCreateInput[],
  ) {
    return prisma.$transaction(async (tx) => {
      const oportunidade = await tx.oportunidade.update({
        where: { id },
        data,
        include: { categoria: true },
      });

      if (midias) {
        await tx.midia.updateMany({
          where: {
            tipoVinculo: TipoVinculoMidia.OPORTUNIDADE,
            registroId: id,
          },
          data: { ativa: false },
        });

        if (midias.length > 0) {
          await tx.midia.createMany({
            data: midias.map((midia) => ({
              ...midia,
              tipoVinculo: TipoVinculoMidia.OPORTUNIDADE,
              registroId: id,
            })),
          });
        }
      }

      const midiasAtivas = await tx.midia.findMany({
        where: {
          tipoVinculo: TipoVinculoMidia.OPORTUNIDADE,
          registroId: id,
          ativa: true,
        },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      });

      return { ...oportunidade, midias: midiasAtivas };
    });
  }

  excluir(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.midia.updateMany({
        where: {
          tipoVinculo: TipoVinculoMidia.OPORTUNIDADE,
          registroId: id,
        },
        data: { ativa: false },
      });

      return tx.oportunidade.delete({ where: { id } });
    });
  }

  private montarWhere(
    filtros: ListarAdminFiltros,
    agora: Date,
  ): Prisma.OportunidadeWhereInput {
    return {
      ...(filtros.status ? { status: filtros.status } : {}),
      ...(filtros.modalidade ? { modalidade: filtros.modalidade } : {}),
      ...(filtros.situacao === "ABERTA" ? { prazo: { gte: agora } } : {}),
      ...(filtros.situacao === "ENCERRADA" ? { prazo: { lt: agora } } : {}),
      ...(filtros.busca
        ? {
            OR: [
              { titulo: { contains: filtros.busca, mode: "insensitive" } },
              { organizador: { contains: filtros.busca, mode: "insensitive" } },
              { local: { contains: filtros.busca, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private async anexarMidias(
    oportunidades: OportunidadeComCategoria[],
  ): Promise<OportunidadeComMidias[]> {
    const ids = oportunidades.map((oportunidade) => oportunidade.id);
    if (ids.length === 0) return [];

    const midias = await prisma.midia.findMany({
      where: {
        tipoVinculo: TipoVinculoMidia.OPORTUNIDADE,
        registroId: { in: ids },
        ativa: true,
      },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
    });

    const midiasPorOportunidade = new Map<string, Midia[]>();
    for (const midia of midias) {
      if (!midia.registroId) continue;
      const lista = midiasPorOportunidade.get(midia.registroId) ?? [];
      lista.push(midia);
      midiasPorOportunidade.set(midia.registroId, lista);
    }

    return oportunidades.map((oportunidade) => ({
      ...oportunidade,
      midias: midiasPorOportunidade.get(oportunidade.id) ?? [],
    }));
  }
}
