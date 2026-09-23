import type { Prisma, StatusPublicacao } from "@prisma/client";
import { StatusPublicacao as StatusPublicacaoEnum, TipoMidia } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";
import { gerarSlug } from "../../common/utils/slug.js";
import type { ImagemRequestDto, VideoLinkRequestDto } from "../midias/dto/midia.request.dto.js";
import type { AtualizarComercioRequestDto } from "./dto/atualizar-comercio.request.dto.js";
import type { CriarComercioRequestDto } from "./dto/criar-comercio.request.dto.js";
import type {
  ListarComerciosAdminQueryDto,
  ListarComerciosQueryDto,
} from "./dto/listar-comercios.query.dto.js";
import { ComerciosMapper } from "./comercios.mapper.js";
import {
  type MidiaComercioCreateInput,
  ComerciosRepository,
} from "./comercios.repository.js";
import { ComerciosRules } from "./comercios.rules.js";

export class ComerciosService {
  constructor(
    private readonly comerciosRepository = new ComerciosRepository(),
    private readonly comerciosMapper = new ComerciosMapper(),
    private readonly comerciosRules = new ComerciosRules(),
  ) {}

  listarCategorias() {
    return this.comerciosRepository.listarCategorias();
  }

  async listarPublicados(filtros: ListarComerciosQueryDto) {
    const { itens, total } = await this.comerciosRepository.listarPublicados({
      pagina: filtros.pagina ?? 1,
      limite: Math.min(filtros.limite ?? 1000, 1000), // Proteção
      ...(filtros.busca ? { busca: filtros.busca } : {}),
      ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
      ...(filtros.patrocinado !== undefined ? { patrocinado: filtros.patrocinado } : {}),
      ...(filtros.possuiPagina !== undefined ? { possuiPagina: filtros.possuiPagina } : {}),
    });

    return { itens: itens.map((comercio) => this.comerciosMapper.paraDetalhe(comercio)), total };
  }

  async listarAdmin(filtros: ListarComerciosAdminQueryDto) {
    const { itens, total } = await this.comerciosRepository.listarAdmin({
      pagina: filtros.pagina ?? 1,
      limite: Math.min(filtros.limite ?? 100, 100), // Proteção admin
      ...(filtros.busca ? { busca: filtros.busca } : {}),
      ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
      ...(filtros.patrocinado !== undefined ? { patrocinado: filtros.patrocinado } : {}),
      ...(filtros.possuiPagina !== undefined ? { possuiPagina: filtros.possuiPagina } : {}),
      ...(filtros.status ? { status: filtros.status as StatusPublicacao } : {}),
    });

    return { itens: itens.map((comercio) => this.comerciosMapper.paraDetalhe(comercio)), total };
  }

  async buscarPublicadoPorSlug(slug: string) {
    const comercio = await this.comerciosRepository.buscarPublicadoPorSlug(slug);
    this.comerciosRules.validarPodeExibirPagina(comercio);
    return this.comerciosMapper.paraDetalhe(comercio!);
  }

  async criarComercio(dto: CriarComercioRequestDto) {
    const categoriaId = await this.resolverCategoriaId(dto.categoriaId, dto.categoriaSlug);
    const slug = dto.slug ?? gerarSlug(dto.nome);
    const comercioComMesmoSlug = await this.comerciosRepository.buscarPorSlug(slug);

    this.comerciosRules.validarSlugDisponivel(comercioComMesmoSlug);

    const status = dto.status as StatusPublicacao;
    const data: Prisma.ComercioUncheckedCreateInput = {
      slug,
      nome: dto.nome,
      categoriaId,
      area: dto.area,
      possuiPagina: dto.possuiPagina,
      patrocinado: dto.patrocinado,
      demonstracao: dto.demonstracao,
      status,
      ...(dto.descricao ? { descricao: dto.descricao } : {}),
      ...(dto.servicos ? { servicos: dto.servicos } : {}),
      ...(dto.horarios ? { horarios: dto.horarios } : {}),
      ...(dto.endereco ? { endereco: dto.endereco } : {}),
      ...(dto.telefone ? { telefone: dto.telefone } : {}),
      ...(dto.whatsapp ? { whatsapp: dto.whatsapp } : {}),
      ...(dto.redesSociais ? { redesSociais: dto.redesSociais } : {}),
      ...(dto.siteExterno ? { siteExterno: dto.siteExterno } : {}),
    };

    if (status === StatusPublicacaoEnum.PUBLICADO) {
      this.comerciosRules.validarPodePublicar({ nome: dto.nome, categoriaId, area: dto.area });
    }

    const comercio = await this.comerciosRepository.criar(data, this.montarMidias(dto));
    return this.comerciosMapper.paraDetalhe(comercio);
  }

  async atualizarComercio(id: string, dto: AtualizarComercioRequestDto) {
    const comercioAtual = await this.comerciosRepository.buscarPorId(id);
    if (!comercioAtual) throw new AppError("Comercio nao encontrado.", 404);

    const slug = dto.slug ?? (dto.nome ? gerarSlug(dto.nome) : undefined);
    if (slug) {
      const comercioComMesmoSlug = await this.comerciosRepository.buscarPorSlug(slug);
      this.comerciosRules.validarSlugDisponivel(comercioComMesmoSlug, id);
    }

    const categoriaId =
      dto.categoriaId || dto.categoriaSlug
        ? await this.resolverCategoriaId(dto.categoriaId, dto.categoriaSlug)
        : undefined;

    const data: Prisma.ComercioUncheckedUpdateInput = {
      ...(slug ? { slug } : {}),
      ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
      ...(categoriaId ? { categoriaId } : {}),
      ...(dto.area !== undefined ? { area: dto.area } : {}),
      ...(dto.descricao !== undefined ? { descricao: dto.descricao } : {}),
      ...(dto.servicos !== undefined ? { servicos: dto.servicos } : {}),
      ...(dto.horarios !== undefined ? { horarios: dto.horarios } : {}),
      ...(dto.endereco !== undefined ? { endereco: dto.endereco } : {}),
      ...(dto.telefone !== undefined ? { telefone: dto.telefone } : {}),
      ...(dto.whatsapp !== undefined ? { whatsapp: dto.whatsapp } : {}),
      ...(dto.redesSociais !== undefined ? { redesSociais: dto.redesSociais } : {}),
      ...(dto.siteExterno !== undefined ? { siteExterno: dto.siteExterno } : {}),
      ...(dto.possuiPagina !== undefined ? { possuiPagina: dto.possuiPagina } : {}),
      ...(dto.patrocinado !== undefined ? { patrocinado: dto.patrocinado } : {}),
      ...(dto.demonstracao !== undefined ? { demonstracao: dto.demonstracao } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };

    const statusFinal = (dto.status ?? comercioAtual.status) as StatusPublicacao;
    if (statusFinal === StatusPublicacaoEnum.PUBLICADO) {
      this.comerciosRules.validarPodePublicar({
        nome: dto.nome ?? comercioAtual.nome,
        categoriaId: categoriaId ?? comercioAtual.categoriaId,
        area: dto.area ?? comercioAtual.area,
      });
    }

    const comercio = await this.comerciosRepository.atualizar(
      id,
      data,
      this.montarMidiasParaAtualizacao(dto, comercioAtual.midias),
    );
    return this.comerciosMapper.paraDetalhe(comercio);
  }

  async publicarComercio(id: string) {
    const comercioAtual = await this.comerciosRepository.buscarPorId(id);
    if (!comercioAtual) throw new AppError("Comercio nao encontrado.", 404);

    this.comerciosRules.validarPodePublicar(comercioAtual);

    const comercio = await this.comerciosRepository.atualizar(id, {
      status: StatusPublicacaoEnum.PUBLICADO,
    });

    return this.comerciosMapper.paraDetalhe(comercio);
  }

  async excluirComercio(id: string) {
    const comercio = await this.comerciosRepository.buscarPorId(id);
    this.comerciosRules.validarExclusao(comercio);
    await this.comerciosRepository.excluir(id);
    return { mensagem: "Comercio excluido com sucesso." };
  }

  private async resolverCategoriaId(categoriaId?: string, categoriaSlug?: string) {
    if (!categoriaId && !categoriaSlug) {
      throw new AppError("Informe a categoria do comercio.", 400);
    }

    const categoria = categoriaId
      ? await this.comerciosRepository.buscarCategoriaPorId(categoriaId)
      : await this.comerciosRepository.buscarCategoriaPorSlug(categoriaSlug!);

    this.comerciosRules.validarCategoriaComercio(categoria);
    return categoria!.id;
  }

  private montarMidias(dto: {
    imagens?: ImagemRequestDto[] | undefined;
    video?: VideoLinkRequestDto | null | undefined;
  }): MidiaComercioCreateInput[] {
    const imagens = (dto.imagens ?? []).map((imagem, index) => ({
      tipoMidia: TipoMidia.IMAGEM,
      url: imagem.url,
      textoAlternativo: imagem.textoAlternativo ?? null,
      credito: imagem.credito ?? null,
      origem: imagem.origem ?? null,
      tamanhoBytes: imagem.tamanhoBytes ?? null,
      duracaoSegundos: null,
      titulo: null,
      ordem: imagem.ordem ?? index,
      ativa: true,
    }));

    const video = dto.video
      ? [{
          tipoMidia: TipoMidia.VIDEO,
          url: dto.video.url,
          titulo: dto.video.titulo ?? null,
          textoAlternativo: null,
          credito: null,
          origem: dto.video.origem,
          tamanhoBytes: null,
          duracaoSegundos: null,
          ordem: 0,
          ativa: true,
        }]
      : [];

    return [...imagens, ...video];
  }

  private montarMidiasParaAtualizacao(
    dto: AtualizarComercioRequestDto,
    midiasAtuais: MidiaComercioCreateInput[],
  ) {
    if (dto.imagens === undefined && dto.video === undefined) return undefined;

    const imagensAtuais = midiasAtuais
      .filter((midia) => midia.tipoMidia === TipoMidia.IMAGEM)
      .map((midia) => ({
        url: midia.url,
        textoAlternativo: midia.textoAlternativo ?? undefined,
        credito: midia.credito ?? undefined,
        origem: midia.origem ?? undefined,
        tamanhoBytes: midia.tamanhoBytes ?? undefined,
        ordem: midia.ordem,
      }));
    const videoAtual = midiasAtuais.find((midia) => midia.tipoMidia === TipoMidia.VIDEO);

    const imagens = dto.imagens ?? imagensAtuais;
    const video = dto.video === undefined && videoAtual
      ? {
          url: videoAtual.url,
          titulo: videoAtual.titulo ?? undefined,
          origem: videoAtual.origem ?? "LINK_EXTERNO",
        }
      : dto.video;

    return this.montarMidias({ imagens, video });
  }
}
