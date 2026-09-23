import type { Midia, Prisma, StatusPublicacao } from "@prisma/client";
import { StatusPublicacao as StatusPublicacaoEnum, TipoMidia } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";
import type {
  ImagemRequestDto,
  VideoLinkRequestDto,
} from "../midias/dto/midia.request.dto.js";
import type { AtualizarEventoRequestDto } from "./dto/atualizar-evento.request.dto.js";
import type { CriarEventoRequestDto } from "./dto/criar-evento.request.dto.js";
import type {
  ListarEventosAdminQueryDto,
  ListarEventosQueryDto,
} from "./dto/listar-eventos.query.dto.js";
import { EventosMapper } from "./eventos.mapper.js";
import { EventosRepository } from "./eventos.repository.js";
import { EventosRules } from "./eventos.rules.js";

export class EventosService {
  constructor(
    private readonly eventosRepository = new EventosRepository(),
    private readonly eventosMapper = new EventosMapper(),
    private readonly eventosRules = new EventosRules(),
  ) {}

  listarCategorias() {
    return this.eventosRepository.listarCategorias();
  }

  async listarPublicados(filtros: ListarEventosQueryDto) {
    const { itens, total } = await this.eventosRepository.listarPublicados(
      filtros,
      this.eventosRules.inicioDoDia(new Date()),
    );

    return { itens: itens.map((evento) => this.eventosMapper.paraDetalhe(evento)), total };
  }

  async listarAdministracao(filtros: ListarEventosAdminQueryDto) {
    const { itens, total } = await this.eventosRepository.listarAdmin(
      { ...filtros, ...(filtros.status ? { status: filtros.status as StatusPublicacao } : {}) },
      this.eventosRules.inicioDoDia(new Date()),
    );

    return { itens: itens.map((evento) => this.eventosMapper.paraDetalhe(evento)), total };
  }

  async buscarPublicadoPorId(id: string) {
    const evento = await this.eventosRepository.buscarPorId(id);
    if (!evento || evento.status !== StatusPublicacaoEnum.PUBLICADO) {
      throw new AppError("Evento nao encontrado.", 404);
    }

    return this.eventosMapper.paraDetalhe(evento);
  }

  async criarEvento(dto: CriarEventoRequestDto) {
    const categoriaId = await this.resolverCategoriaId(dto.categoriaId, dto.categoriaSlug);
    const dataEvento = new Date(dto.data);
    const status = dto.status as StatusPublicacao;
    const data: Prisma.EventoUncheckedCreateInput = {
      titulo: dto.titulo,
      categoriaId,
      data: dataEvento,
      local: dto.local,
      organizador: dto.organizador,
      descricao: dto.descricao,
      entrada: dto.entrada,
      demonstracao: dto.demonstracao,
      status,
      ...(dto.horario ? { horario: dto.horario } : {}),
      ...(dto.contato ? { contato: dto.contato } : {}),
      ...(dto.fonte ? { fonte: dto.fonte } : {}),
    };

    if (status === StatusPublicacaoEnum.PUBLICADO) {
      this.eventosRules.validarPodePublicar(data as Parameters<EventosRules["validarPodePublicar"]>[0]);
    }

    const evento = await this.eventosRepository.criar(data, this.montarMidias(dto));
    return this.eventosMapper.paraDetalhe(evento);
  }

  async atualizarEvento(id: string, dto: AtualizarEventoRequestDto) {
    const eventoAtual = await this.eventosRepository.buscarPorId(id);
    if (!eventoAtual) throw new AppError("Evento nao encontrado.", 404);

    const categoriaId =
      dto.categoriaId || dto.categoriaSlug
        ? await this.resolverCategoriaId(dto.categoriaId, dto.categoriaSlug)
        : undefined;

    const data: Prisma.EventoUncheckedUpdateInput = {
      ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
      ...(categoriaId ? { categoriaId } : {}),
      ...(dto.data !== undefined ? { data: new Date(dto.data) } : {}),
      ...(dto.horario !== undefined ? { horario: dto.horario } : {}),
      ...(dto.local !== undefined ? { local: dto.local } : {}),
      ...(dto.organizador !== undefined ? { organizador: dto.organizador } : {}),
      ...(dto.descricao !== undefined ? { descricao: dto.descricao } : {}),
      ...(dto.entrada !== undefined ? { entrada: dto.entrada } : {}),
      ...(dto.contato !== undefined ? { contato: dto.contato } : {}),
      ...(dto.fonte !== undefined ? { fonte: dto.fonte } : {}),
      ...(dto.demonstracao !== undefined ? { demonstracao: dto.demonstracao } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };

    const statusFinal = (dto.status ?? eventoAtual.status) as StatusPublicacao;
    if (statusFinal === StatusPublicacaoEnum.PUBLICADO) {
      this.eventosRules.validarPodePublicar({
        titulo: dto.titulo ?? eventoAtual.titulo,
        categoriaId: categoriaId ?? eventoAtual.categoriaId,
        data: dto.data ? new Date(dto.data) : eventoAtual.data,
        local: dto.local ?? eventoAtual.local,
        organizador: dto.organizador ?? eventoAtual.organizador,
        descricao: dto.descricao ?? eventoAtual.descricao,
        entrada: dto.entrada ?? eventoAtual.entrada,
      });
    }

    const evento = await this.eventosRepository.atualizar(
      id,
      data,
      this.montarMidiasParaAtualizacao(dto, eventoAtual.midias),
    );
    return this.eventosMapper.paraDetalhe(evento);
  }

  async publicarEvento(id: string) {
    const eventoAtual = await this.eventosRepository.buscarPorId(id);
    if (!eventoAtual) throw new AppError("Evento nao encontrado.", 404);

    this.eventosRules.validarPodePublicar(eventoAtual);

    const evento = await this.eventosRepository.atualizar(id, {
      status: StatusPublicacaoEnum.PUBLICADO,
    });

    return this.eventosMapper.paraDetalhe(evento);
  }

  async excluirEvento(id: string) {
    const evento = await this.eventosRepository.buscarPorId(id);
    this.eventosRules.validarExclusao(evento);
    await this.eventosRepository.excluir(id);
    return { mensagem: "Evento excluido com sucesso." };
  }

  private async resolverCategoriaId(categoriaId?: string, categoriaSlug?: string) {
    if (!categoriaId && !categoriaSlug) {
      throw new AppError("Informe a categoria do evento.", 400);
    }

    const categoria = categoriaId
      ? await this.eventosRepository.buscarCategoriaPorId(categoriaId)
      : await this.eventosRepository.buscarCategoriaPorSlug(categoriaSlug!);

    this.eventosRules.validarCategoriaEvento(categoria);
    return categoria!.id;
  }

  private montarMidias(dto: {
    imagens?: ImagemRequestDto[] | undefined;
    video?: VideoLinkRequestDto | null | undefined;
  }) {
    const imagens = (dto.imagens ?? []).map((imagem, index) => ({
      tipoMidia: TipoMidia.IMAGEM,
      url: imagem.url,
      textoAlternativo: imagem.textoAlternativo ?? null,
      credito: imagem.credito ?? null,
      origem: imagem.origem ?? "UPLOAD_ADMIN",
      tamanhoBytes: imagem.tamanhoBytes ?? null,
      ordem: imagem.ordem ?? index,
    }));
    const video = dto.video
      ? [
          {
            tipoMidia: TipoMidia.VIDEO,
            url: dto.video.url,
            titulo: dto.video.titulo ?? null,
            origem: dto.video.origem,
            ordem: 99,
          },
        ]
      : [];

    return [...imagens, ...video];
  }

  private montarMidiasParaAtualizacao(
    dto: {
      imagens?: ImagemRequestDto[] | undefined;
      video?: VideoLinkRequestDto | null | undefined;
    },
    midiasAtuais: Midia[],
  ) {
    if (dto.imagens === undefined && dto.video === undefined) return undefined;

    const imagensAtuais = midiasAtuais
      .filter((midia) => midia.tipoMidia === TipoMidia.IMAGEM)
      .map((midia) => ({
        url: midia.url,
        textoAlternativo: midia.textoAlternativo ?? undefined,
        credito: midia.credito ?? undefined,
        origem: midia.origem ?? "UPLOAD_ADMIN",
        tamanhoBytes: midia.tamanhoBytes ?? undefined,
        ordem: midia.ordem,
      }));
    const videoAtual = midiasAtuais.find((midia) => midia.tipoMidia === TipoMidia.VIDEO);
    const imagens = dto.imagens ?? imagensAtuais;
    const video =
      dto.video === undefined && videoAtual
        ? {
            url: videoAtual.url,
            titulo: videoAtual.titulo ?? undefined,
            origem: videoAtual.origem ?? "LINK_EXTERNO",
          }
        : dto.video;

    return this.montarMidias({ imagens, video });
  }
}
