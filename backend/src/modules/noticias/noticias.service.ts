import type { Prisma, StatusPublicacao } from "@prisma/client";
import { StatusPublicacao as StatusPublicacaoEnum, TipoMidia } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";
import { gerarSlug } from "../../common/utils/slug.js";
import type { ImagemRequestDto, VideoLinkRequestDto } from "../midias/dto/midia.request.dto.js";
import type { AtualizarNoticiaRequestDto } from "./dto/atualizar-noticia.request.dto.js";
import type { CriarNoticiaRequestDto } from "./dto/criar-noticia.request.dto.js";
import type {
  ListarNoticiasAdminQueryDto,
  ListarNoticiasQueryDto,
} from "./dto/listar-noticias.query.dto.js";
import { NoticiasMapper } from "./noticias.mapper.js";
import {
  type MidiaNoticiaCreateInput,
  NoticiasRepository,
} from "./noticias.repository.js";
import { NoticiasRules } from "./noticias.rules.js";
import { LeiturasRules } from "./leituras.rules.js";
import { env } from "../../config/env.js";
import type { RegistrarLeituraRequestDto } from "./dto/registrar-leitura.request.dto.js";
import type { RegistrarLeituraResponseDto } from "./dto/registrar-leitura.response.dto.js";

export class NoticiasService {
  constructor(
    private readonly noticiasRepository = new NoticiasRepository(),
    private readonly noticiasMapper = new NoticiasMapper(),
    private readonly noticiasRules = new NoticiasRules(),
  ) {}

  async listarCategorias() {
    return this.noticiasRepository.listarCategorias();
  }

  async listarPublicadas(filtros: ListarNoticiasQueryDto) {
    const { itens, total } = await this.noticiasRepository.listarPublicas({
      pagina: filtros.pagina,
      limite: filtros.limite,
      ordenacao: filtros.ordenacao,
      ...(filtros.busca ? { busca: filtros.busca } : {}),
      ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
      ...(filtros.destaque !== undefined ? { destaque: filtros.destaque } : {}),
    });
    return {
      itens: itens.map((noticia) => this.noticiasMapper.paraDetalhe(noticia)),
      total,
    };
  }

  async registrarLeitura(slug: string, dto: RegistrarLeituraRequestDto): Promise<RegistrarLeituraResponseDto> {
    const regras = new LeiturasRules();
    return this.noticiasRepository.registrarLeitura(
      slug, regras.identificarCliente(dto.clienteId, env.JWT_SECRET), regras.obterDiaLocal(),
    );
  }

  async listarAdministracao(filtros: ListarNoticiasAdminQueryDto) {
    const { itens, total } = await this.noticiasRepository.listarAdmin({
      pagina: filtros.pagina,
      limite: filtros.limite,
      ...(filtros.busca ? { busca: filtros.busca } : {}),
      ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
      ...(filtros.destaque !== undefined ? { destaque: filtros.destaque } : {}),
      ...(filtros.status ? { status: filtros.status as StatusPublicacao } : {}),
    });
    return {
      itens: itens.map((noticia) => this.noticiasMapper.paraDetalhe(noticia)),
      total,
    };
  }

  async buscarPublicadaPorSlug(slug: string) {
    const noticia = await this.noticiasRepository.buscarPublicaPorSlug(slug);
    if (!noticia) throw new AppError("Noticia nao encontrada.", 404);
    return this.noticiasMapper.paraDetalhe(noticia);
  }

  async criarNoticia(dto: CriarNoticiaRequestDto) {
    const categoriaId = await this.resolverCategoriaId(dto.categoriaId, dto.categoriaSlug);
    const slug = dto.slug ?? gerarSlug(dto.titulo);
    const noticiaComMesmoSlug = await this.noticiasRepository.buscarPorSlug(slug);

    this.noticiasRules.validarSlugDisponivel(noticiaComMesmoSlug);

    const status = dto.status as StatusPublicacao;
    const data: Prisma.NoticiaUncheckedCreateInput = {
      slug,
      titulo: dto.titulo,
      resumo: dto.resumo,
      corpo: dto.corpo,
      autorNome: dto.autorNome,
      categoriaId,
      tipoConteudo: dto.tipoConteudo,
      status,
      destaque: dto.destaque,
      demonstracao: dto.demonstracao,
      publicadoEm: status === StatusPublicacaoEnum.PUBLICADO ? new Date() : null,
      ...(dto.fontes ? { fontes: dto.fontes } : {}),
      ...(dto.imagemUrl ? { imagemUrl: dto.imagemUrl } : {}),
      ...(dto.imagemAlt ? { imagemAlt: dto.imagemAlt } : {}),
      ...(dto.imagemCredito ? { imagemCredito: dto.imagemCredito } : {}),
    };

    if (status === StatusPublicacaoEnum.PUBLICADO) {
      this.noticiasRules.validarPodePublicar({
        titulo: dto.titulo,
        resumo: dto.resumo,
        corpo: dto.corpo,
        categoriaId,
      });
    }

    const noticia = await this.noticiasRepository.criar(data, this.montarMidias(dto));
    return this.noticiasMapper.paraDetalhe(noticia);
  }

  async atualizarNoticia(id: string, dto: AtualizarNoticiaRequestDto) {
    const noticiaAtual = await this.noticiasRepository.buscarPorId(id);
    if (!noticiaAtual) throw new AppError("Noticia nao encontrada.", 404);

    const slug = dto.slug ?? (dto.titulo ? gerarSlug(dto.titulo) : undefined);
    if (slug) {
      const noticiaComMesmoSlug = await this.noticiasRepository.buscarPorSlug(slug);
      this.noticiasRules.validarSlugDisponivel(noticiaComMesmoSlug, id);
    }

    const categoriaId =
      dto.categoriaId || dto.categoriaSlug
        ? await this.resolverCategoriaId(dto.categoriaId, dto.categoriaSlug)
        : undefined;

    const data: Prisma.NoticiaUncheckedUpdateInput = {
      ...(slug ? { slug } : {}),
      ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
      ...(dto.resumo !== undefined ? { resumo: dto.resumo } : {}),
      ...(dto.corpo !== undefined ? { corpo: dto.corpo } : {}),
      ...(dto.fontes !== undefined ? { fontes: dto.fontes } : {}),
      ...(dto.autorNome !== undefined ? { autorNome: dto.autorNome } : {}),
      ...(categoriaId ? { categoriaId } : {}),
      ...(dto.tipoConteudo !== undefined ? { tipoConteudo: dto.tipoConteudo } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.destaque !== undefined ? { destaque: dto.destaque } : {}),
      ...(dto.demonstracao !== undefined ? { demonstracao: dto.demonstracao } : {}),
      ...(dto.imagemUrl !== undefined ? { imagemUrl: dto.imagemUrl } : {}),
      ...(dto.imagemAlt !== undefined ? { imagemAlt: dto.imagemAlt } : {}),
      ...(dto.imagemCredito !== undefined ? { imagemCredito: dto.imagemCredito } : {}),
    };

    const statusFinal = (dto.status ?? noticiaAtual.status) as StatusPublicacao;
    if (statusFinal === StatusPublicacaoEnum.PUBLICADO) {
      this.noticiasRules.validarPodePublicar({
        titulo: dto.titulo ?? noticiaAtual.titulo,
        resumo: dto.resumo ?? noticiaAtual.resumo,
        corpo: dto.corpo ?? noticiaAtual.corpo,
        categoriaId: categoriaId ?? noticiaAtual.categoriaId,
      });
      if (!noticiaAtual.publicadoEm) data.publicadoEm = new Date();
    }

    const noticia = await this.noticiasRepository.atualizar(
      id,
      data,
      this.montarMidiasParaAtualizacao(dto, noticiaAtual.midias),
    );
    return this.noticiasMapper.paraDetalhe(noticia);
  }

  async publicarNoticia(id: string) {
    const noticiaAtual = await this.noticiasRepository.buscarPorId(id);
    if (!noticiaAtual) throw new AppError("Noticia nao encontrada.", 404);

    this.noticiasRules.validarPodePublicar(noticiaAtual);

    const noticia = await this.noticiasRepository.atualizar(id, {
      status: StatusPublicacaoEnum.PUBLICADO,
      publicadoEm: noticiaAtual.publicadoEm ?? new Date(),
    });

    return this.noticiasMapper.paraDetalhe(noticia);
  }

  async excluirNoticia(id: string) {
    const noticia = await this.noticiasRepository.buscarPorId(id);
    this.noticiasRules.validarExclusao(noticia);
    await this.noticiasRepository.excluir(id);
    return { mensagem: "Noticia excluida com sucesso." };
  }

  private async resolverCategoriaId(categoriaId?: string, categoriaSlug?: string) {
    if (!categoriaId && !categoriaSlug) {
      throw new AppError("Informe a categoria da noticia.", 400);
    }

    const categoria = categoriaId
      ? await this.noticiasRepository.buscarCategoriaPorId(categoriaId)
      : await this.noticiasRepository.buscarCategoriaPorSlug(categoriaSlug!);

    this.noticiasRules.validarCategoriaNoticia(categoria);
    return categoria!.id;
  }

  private montarMidias(dto: {
    imagens?: ImagemRequestDto[] | undefined;
    video?: VideoLinkRequestDto | null | undefined;
    imagemUrl?: string | undefined;
    imagemAlt?: string | undefined;
    imagemCredito?: string | undefined;
  }): MidiaNoticiaCreateInput[] {
    const imagensInformadas =
      dto.imagens ??
      (dto.imagemUrl
        ? [
            {
              url: dto.imagemUrl,
              textoAlternativo: dto.imagemAlt,
              credito: dto.imagemCredito,
              origem: "CAMPO_LEGADO",
              ordem: 0,
            },
          ]
        : []);

    const imagens = imagensInformadas.map((imagem, index) => ({
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
      ? [
          {
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
          },
        ]
      : [];

    return [...imagens, ...video];
  }

  private montarMidiasParaAtualizacao(
    dto: AtualizarNoticiaRequestDto,
    midiasAtuais: MidiaNoticiaCreateInput[],
  ) {
    const recebeuImagemLegada =
      dto.imagemUrl !== undefined || dto.imagemAlt !== undefined || dto.imagemCredito !== undefined;
    const recebeuMidiaNova = dto.imagens !== undefined || dto.video !== undefined;

    if (!recebeuImagemLegada && !recebeuMidiaNova) return undefined;

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
    const imagens =
      dto.imagens ??
      (recebeuImagemLegada
        ? [
            {
              url: dto.imagemUrl ?? imagensAtuais[0]?.url ?? "",
              textoAlternativo: dto.imagemAlt ?? imagensAtuais[0]?.textoAlternativo,
              credito: dto.imagemCredito ?? imagensAtuais[0]?.credito,
              origem: imagensAtuais[0]?.origem ?? "CAMPO_LEGADO",
              tamanhoBytes: imagensAtuais[0]?.tamanhoBytes,
              ordem: 0,
            },
          ].filter((imagem) => imagem.url)
        : imagensAtuais);

    const video =
      dto.video === undefined && videoAtual
        ? {
            url: videoAtual.url,
            titulo: videoAtual.titulo ?? undefined,
            origem: videoAtual.origem ?? "LINK_EXTERNO",
          }
        : dto.video;

    return this.montarMidias({
      imagens,
      video,
    });
  }
}
