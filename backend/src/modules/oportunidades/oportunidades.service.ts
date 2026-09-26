import type { Midia, ModalidadeOportunidade, Prisma, StatusPublicacao } from "@prisma/client";
import { StatusPublicacao as StatusPublicacaoEnum, TipoMidia } from "@prisma/client";
import { AppError } from "../../common/errors/app-error.js";
import type {
  ImagemRequestDto,
  VideoLinkRequestDto,
} from "../midias/dto/midia.request.dto.js";
import type { AtualizarOportunidadeRequestDto } from "./dto/atualizar-oportunidade.request.dto.js";
import type { CriarOportunidadeRequestDto } from "./dto/criar-oportunidade.request.dto.js";
import type {
  ListarOportunidadesAdminQueryDto,
  ListarOportunidadesQueryDto,
} from "./dto/listar-oportunidades.query.dto.js";
import { OportunidadesMapper } from "./oportunidades.mapper.js";
import { OportunidadesRepository } from "./oportunidades.repository.js";
import { OportunidadesRules } from "./oportunidades.rules.js";

export class OportunidadesService {
  constructor(
    private readonly oportunidadesRepository = new OportunidadesRepository(),
    private readonly oportunidadesMapper = new OportunidadesMapper(),
    private readonly oportunidadesRules = new OportunidadesRules(),
  ) {}

  listarCategorias() {
    return this.oportunidadesRepository.listarCategorias();
  }

  async listarPublicadas(filtros: ListarOportunidadesQueryDto) {
    const agora = new Date();

    const { itens, total } = await this.oportunidadesRepository.listarPublicadas(
      {
        busca: filtros.busca,
        modalidade: filtros.modalidade as ModalidadeOportunidade | undefined,
        situacao: (filtros.situacao as any) ?? "TODAS",
        pagina: filtros.pagina ?? 1,
        limite: Math.min(filtros.limite ?? 1000, 1000), // Proteção
      },
      agora,
    );

    return { itens: itens.map((op) => this.oportunidadesMapper.paraDetalhe(op)), total };
  }

  async listarAdministracao(filtros: ListarOportunidadesAdminQueryDto) {
    const agora = new Date();

    const { itens, total } = await this.oportunidadesRepository.listarAdmin(
      {
        busca: filtros.busca,
        modalidade: filtros.modalidade as ModalidadeOportunidade | undefined,
        situacao: (filtros.situacao as any) ?? "TODAS",
        status: filtros.status as StatusPublicacao | undefined,
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        pagina: filtros.pagina ?? 1,
        limite: Math.min(filtros.limite ?? 100, 100), // Proteção admin
      },
      agora,
    );

    return { itens: itens.map((op) => this.oportunidadesMapper.paraDetalhe(op)), total };
  }

  async buscarPublicadaPorId(id: string) {
    const oportunidade = await this.oportunidadesRepository.buscarPorId(id);
    if (!oportunidade || oportunidade.status !== StatusPublicacaoEnum.PUBLICADO) {
      throw new AppError("Oportunidade nao encontrada.", 404);
    }

    return this.oportunidadesMapper.paraDetalhe(oportunidade);
  }

  async criarOportunidade(dto: CriarOportunidadeRequestDto) {
    const categoriaId =
      dto.categoriaId || dto.categoriaSlug
        ? await this.resolverCategoriaId(dto.categoriaId, dto.categoriaSlug)
        : undefined;
    const prazo = new Date(dto.prazo);
    const status = dto.status as StatusPublicacao;
    const data: Prisma.OportunidadeUncheckedCreateInput = {
      titulo: dto.titulo,
      organizador: dto.organizador,
      modalidade: dto.modalidade as ModalidadeOportunidade,
      prazo,
      demonstracao: dto.demonstracao,
      status,
      ...(dto.local ? { local: dto.local } : {}),
      ...(dto.requisitos ? { requisitos: dto.requisitos } : {}),
      ...(dto.custo ? { custo: dto.custo } : {}),
      ...(dto.linkInscricao ? { linkInscricao: dto.linkInscricao } : {}),
      ...(categoriaId ? { categoriaId } : {}),
    };

    if (status === StatusPublicacaoEnum.PUBLICADO) {
      this.oportunidadesRules.validarPodePublicar({
        titulo: dto.titulo,
        organizador: dto.organizador,
        modalidade: dto.modalidade as ModalidadeOportunidade,
        prazo,
      });
    }

    const oportunidade = await this.oportunidadesRepository.criar(data, this.montarMidias(dto));
    return this.oportunidadesMapper.paraDetalhe(oportunidade);
  }

  async atualizarOportunidade(id: string, dto: AtualizarOportunidadeRequestDto) {
    const oportunidadeAtual = await this.oportunidadesRepository.buscarPorId(id);
    if (!oportunidadeAtual) throw new AppError("Oportunidade nao encontrada.", 404);

    const categoriaId =
      dto.categoriaId || dto.categoriaSlug
        ? await this.resolverCategoriaId(dto.categoriaId, dto.categoriaSlug)
        : undefined;

    const data: Prisma.OportunidadeUncheckedUpdateInput = {
      ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
      ...(dto.organizador !== undefined ? { organizador: dto.organizador } : {}),
      ...(dto.modalidade !== undefined
        ? { modalidade: dto.modalidade as ModalidadeOportunidade }
        : {}),
      ...(dto.local !== undefined ? { local: dto.local } : {}),
      ...(dto.prazo !== undefined ? { prazo: new Date(dto.prazo) } : {}),
      ...(dto.requisitos !== undefined ? { requisitos: dto.requisitos } : {}),
      ...(dto.custo !== undefined ? { custo: dto.custo } : {}),
      ...(dto.linkInscricao !== undefined ? { linkInscricao: dto.linkInscricao } : {}),
      ...(categoriaId ? { categoriaId } : {}),
      ...(dto.demonstracao !== undefined ? { demonstracao: dto.demonstracao } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };

    const statusFinal = (dto.status ?? oportunidadeAtual.status) as StatusPublicacao;
    if (statusFinal === StatusPublicacaoEnum.PUBLICADO) {
      this.oportunidadesRules.validarPodePublicar({
        titulo: dto.titulo ?? oportunidadeAtual.titulo,
        organizador: dto.organizador ?? oportunidadeAtual.organizador,
        modalidade: (dto.modalidade ?? oportunidadeAtual.modalidade) as ModalidadeOportunidade,
        prazo: dto.prazo ? new Date(dto.prazo) : oportunidadeAtual.prazo,
      });
    }

    const oportunidade = await this.oportunidadesRepository.atualizar(
      id,
      data,
      this.montarMidiasParaAtualizacao(dto, oportunidadeAtual.midias),
    );
    return this.oportunidadesMapper.paraDetalhe(oportunidade);
  }

  async publicarOportunidade(id: string) {
    const oportunidadeAtual = await this.oportunidadesRepository.buscarPorId(id);
    if (!oportunidadeAtual) throw new AppError("Oportunidade nao encontrada.", 404);

    this.oportunidadesRules.validarPodePublicar(oportunidadeAtual);

    const oportunidade = await this.oportunidadesRepository.atualizar(id, {
      status: StatusPublicacaoEnum.PUBLICADO,
    });

    return this.oportunidadesMapper.paraDetalhe(oportunidade);
  }

  async excluirOportunidade(id: string) {
    const oportunidade = await this.oportunidadesRepository.buscarPorId(id);
    this.oportunidadesRules.validarExclusao(oportunidade);
    await this.oportunidadesRepository.excluir(id);
    return { mensagem: "Oportunidade excluida com sucesso." };
  }

  private async resolverCategoriaId(categoriaId?: string, categoriaSlug?: string) {
    const categoria = categoriaId
      ? await this.oportunidadesRepository.buscarCategoriaPorId(categoriaId)
      : await this.oportunidadesRepository.buscarCategoriaPorSlug(categoriaSlug!);

    this.oportunidadesRules.validarCategoriaOportunidade(categoria);
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
