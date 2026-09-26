import type { Midia, Prisma, StatusPublicacao } from "@prisma/client";
import { TipoCategoria, TipoVinculoMidia } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import { parseDataInicio, parseDataFim } from "../../common/utils/data-fuso.js";

type SituacaoEvento = "FUTURO" | "ENCERRADO" | "TODOS";

type ListarPublicosFiltros = {
  busca?: string | undefined;
  categoria?: string | undefined;
  situacao: SituacaoEvento;
  pagina: number;
  limite: number;
};

type ListarAdminFiltros = ListarPublicosFiltros & {
  status?: StatusPublicacao | undefined;
  dataInicio?: string | undefined;
  dataFim?: string | undefined;
};

type EventoComCategoria = Prisma.EventoGetPayload<{
  include: { categoria: true };
}>;

export type EventoComMidias = EventoComCategoria & {
  midias: Midia[];
};

export type MidiaEventoCreateInput = Omit<
  Prisma.MidiaUncheckedCreateInput,
  "id" | "tipoVinculo" | "registroId" | "criadoEm" | "alteradoEm"
>;

export class EventosRepository {
  buscarCategoriaPorId(id: string) {
    return prisma.categoria.findUnique({ where: { id } });
  }

  buscarCategoriaPorSlug(slug: string) {
    return prisma.categoria.findUnique({
      where: {
        slug_tipo: {
          slug,
          tipo: TipoCategoria.EVENTO,
        },
      },
    });
  }

  async buscarPorId(id: string) {
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!evento) return null;
    return this.anexarMidias([evento]).then((eventos) => eventos[0] ?? null);
  }

  listarCategorias() {
    return prisma.categoria.findMany({
      where: { tipo: TipoCategoria.EVENTO, ativa: true },
      orderBy: { ordem: "asc" },
    });
  }

  async listarPublicados(filtros: ListarPublicosFiltros, inicioHoje: Date) {
    const where = this.montarWhere({ ...filtros, status: "PUBLICADO" }, inicioHoje);
    const [total, eventos] = await prisma.$transaction([
      prisma.evento.count({ where }),
      prisma.evento.findMany({
        where,
        include: { categoria: true },
        orderBy: [{ data: "asc" }],
        skip: (filtros.pagina - 1) * filtros.limite,
        take: filtros.limite,
      }),
    ]);

    const itens = await this.anexarMidias(eventos);
    return { itens, total };
  }

  async listarAdmin(filtros: ListarAdminFiltros, inicioHoje: Date) {
    const where = this.montarWhere(filtros, inicioHoje);
    const [total, eventos] = await prisma.$transaction([
      prisma.evento.count({ where }),
      prisma.evento.findMany({
        where,
        include: { categoria: true },
        orderBy: [{ data: "asc" }],
        skip: (filtros.pagina - 1) * filtros.limite,
        take: filtros.limite,
      }),
    ]);

    const itens = await this.anexarMidias(eventos);
    return { itens, total };
  }

  criar(data: Prisma.EventoUncheckedCreateInput, midias: MidiaEventoCreateInput[] = []) {
    return prisma.$transaction(async (tx) => {
      const evento = await tx.evento.create({
        data,
        include: { categoria: true },
      });

      if (midias.length > 0) {
        await tx.midia.createMany({
          data: midias.map((midia) => ({
            ...midia,
            tipoVinculo: TipoVinculoMidia.EVENTO,
            registroId: evento.id,
          })),
        });
      }

      const midiasCriadas = await tx.midia.findMany({
        where: {
          tipoVinculo: TipoVinculoMidia.EVENTO,
          registroId: evento.id,
          ativa: true,
        },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      });

      return { ...evento, midias: midiasCriadas };
    });
  }

  atualizar(
    id: string,
    data: Prisma.EventoUncheckedUpdateInput,
    midias?: MidiaEventoCreateInput[],
  ) {
    return prisma.$transaction(async (tx) => {
      const evento = await tx.evento.update({
        where: { id },
        data,
        include: { categoria: true },
      });

      if (midias) {
        await tx.midia.updateMany({
          where: {
            tipoVinculo: TipoVinculoMidia.EVENTO,
            registroId: id,
          },
          data: { ativa: false },
        });

        if (midias.length > 0) {
          await tx.midia.createMany({
            data: midias.map((midia) => ({
              ...midia,
              tipoVinculo: TipoVinculoMidia.EVENTO,
              registroId: id,
            })),
          });
        }
      }

      const midiasAtivas = await tx.midia.findMany({
        where: {
          tipoVinculo: TipoVinculoMidia.EVENTO,
          registroId: id,
          ativa: true,
        },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      });

      return { ...evento, midias: midiasAtivas };
    });
  }

  excluir(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.midia.updateMany({
        where: {
          tipoVinculo: TipoVinculoMidia.EVENTO,
          registroId: id,
        },
        data: { ativa: false },
      });

      return tx.evento.delete({ where: { id } });
    });
  }

  private montarWhere(filtros: ListarAdminFiltros, inicioHoje: Date): Prisma.EventoWhereInput {
    const filtroData: Prisma.DateTimeFilter = {};
    if (filtros.situacao === "FUTURO") {
      filtroData.gte = inicioHoje;
    } else if (filtros.situacao === "ENCERRADO") {
      filtroData.lt = inicioHoje;
    }

    if (filtros.dataInicio) {
      filtroData.gte = parseDataInicio(filtros.dataInicio);
    }
    if (filtros.dataFim) {
      filtroData.lte = parseDataFim(filtros.dataFim);
    }

    return {
      ...(filtros.status ? { status: filtros.status } : {}),
      ...(Object.keys(filtroData).length > 0 ? { data: filtroData } : {}),
      ...(filtros.categoria
        ? {
            categoria: {
              slug: filtros.categoria,
              tipo: TipoCategoria.EVENTO,
            },
          }
        : {}),
      ...(filtros.busca
        ? {
            OR: [
              { titulo: { contains: filtros.busca, mode: "insensitive" } },
              { local: { contains: filtros.busca, mode: "insensitive" } },
              { organizador: { contains: filtros.busca, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private async anexarMidias(eventos: EventoComCategoria[]): Promise<EventoComMidias[]> {
    const ids = eventos.map((evento) => evento.id);
    if (ids.length === 0) return [];

    const midias = await prisma.midia.findMany({
      where: {
        tipoVinculo: TipoVinculoMidia.EVENTO,
        registroId: { in: ids },
        ativa: true,
      },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
    });

    const midiasPorEvento = new Map<string, Midia[]>();
    for (const midia of midias) {
      if (!midia.registroId) continue;
      const lista = midiasPorEvento.get(midia.registroId) ?? [];
      lista.push(midia);
      midiasPorEvento.set(midia.registroId, lista);
    }

    return eventos.map((evento) => ({
      ...evento,
      midias: midiasPorEvento.get(evento.id) ?? [],
    }));
  }
}
