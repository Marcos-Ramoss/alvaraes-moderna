import type { Request, Response } from "express";
import type { AtualizarNoticiaRequestDto } from "./dto/atualizar-noticia.request.dto.js";
import type { CriarNoticiaRequestDto } from "./dto/criar-noticia.request.dto.js";
import type {
  ListarNoticiasAdminQueryDto,
  ListarNoticiasQueryDto,
} from "./dto/listar-noticias.query.dto.js";
import { NoticiasService } from "./noticias.service.js";
import type { RegistrarLeituraRequestDto } from "./dto/registrar-leitura.request.dto.js";
import { auditoriaService } from "../auditoria/auditoria.service.js";

type NoticiaSlugParams = { slug: string };
type NoticiaIdParams = { id: string };

export class NoticiasController {
  constructor(private readonly noticiasService = new NoticiasService()) {}

  listarCategorias = async (req: Request, res: Response) => {
    const categorias = await this.noticiasService.listarCategorias();
    return res.json({ dados: categorias });
  };

  listarPublicadas = async (req: Request, res: Response) => {
    const query = req.dadosValidados?.query as ListarNoticiasQueryDto;
    const { itens, total } = await this.noticiasService.listarPublicadas(query);
    return res.json({ dados: itens, total });
  };

  buscarPublicadaPorSlug = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as NoticiaSlugParams;
    const noticia = await this.noticiasService.buscarPublicadaPorSlug(params.slug);
    return res.json({ dados: noticia });
  };

  registrarLeitura = async (req: Request, res: Response) => {
    const { slug } = req.dadosValidados?.params as NoticiaSlugParams;
    const body = req.dadosValidados?.body as RegistrarLeituraRequestDto;
    res.setHeader("Cache-Control", "no-store");
    return res.json({ dados: await this.noticiasService.registrarLeitura(slug, body) });
  };

  listarAdministracao = async (req: Request, res: Response) => {
    const query = req.dadosValidados?.query as ListarNoticiasAdminQueryDto;
    const { itens, total } = await this.noticiasService.listarAdministracao(query);
    return res.json({ dados: itens, total });
  };

  criarNoticia = async (req: Request, res: Response) => {
    const body = req.dadosValidados?.body as CriarNoticiaRequestDto;
    const noticia = await this.noticiasService.criarNoticia(body);

    await auditoriaService.registrar({
      req,
      acao: "CRIAR",
      recurso: "NOTICIA",
      recursoId: noticia.id,
      tituloRecurso: noticia.titulo,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} cadastrou a notícia '${noticia.titulo}'.`,
      dadosNovos: { id: noticia.id, titulo: noticia.titulo, status: noticia.status },
    });

    return res.status(201).json({ dados: noticia });
  };

  atualizarNoticia = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as NoticiaIdParams;
    const body = req.dadosValidados?.body as AtualizarNoticiaRequestDto;
    const noticia = await this.noticiasService.atualizarNoticia(params.id, body);

    await auditoriaService.registrar({
      req,
      acao: "ATUALIZAR",
      recurso: "NOTICIA",
      recursoId: noticia.id,
      tituloRecurso: noticia.titulo,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} editou a notícia '${noticia.titulo}'.`,
      dadosNovos: { id: noticia.id, titulo: noticia.titulo, status: noticia.status },
    });

    return res.json({ dados: noticia });
  };

  publicarNoticia = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as NoticiaIdParams;
    const noticia = await this.noticiasService.publicarNoticia(params.id);

    await auditoriaService.registrar({
      req,
      acao: "PUBLICAR",
      recurso: "NOTICIA",
      recursoId: noticia.id,
      tituloRecurso: noticia.titulo,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} publicou a notícia '${noticia.titulo}'.`,
      dadosNovos: { status: noticia.status },
    });

    return res.json({ dados: noticia });
  };

  excluirNoticia = async (req: Request, res: Response) => {
    const params = req.dadosValidados?.params as NoticiaIdParams;
    const resultado = await this.noticiasService.excluirNoticia(params.id);

    await auditoriaService.registrar({
      req,
      acao: "EXCLUIR",
      recurso: "NOTICIA",
      recursoId: params.id,
      descricao: `${req.usuarioAutenticado?.nome ?? "Administrador"} excluiu a notícia (ID: ${params.id}).`,
    });

    return res.json(resultado);
  };
}
