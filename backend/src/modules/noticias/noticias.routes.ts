import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { atualizarNoticiaRequestDto } from "./dto/atualizar-noticia.request.dto.js";
import { criarNoticiaRequestDto } from "./dto/criar-noticia.request.dto.js";
import {
  listarNoticiasAdminQueryDto,
  listarNoticiasQueryDto,
} from "./dto/listar-noticias.query.dto.js";
import { noticiaIdParamsDto, noticiaSlugParamsDto } from "./dto/noticia-params.dto.js";
import { NoticiasController } from "./noticias.controller.js";
import { registrarLeituraRequestDto } from "./dto/registrar-leitura.request.dto.js";
import { autorizar } from "../auth/auth.middleware.js";

const noticiasController = new NoticiasController();

export const noticiasRoutes = Router();

noticiasRoutes.post(
  "/noticias/:slug/leituras",
  validarRequest({ params: noticiaSlugParamsDto, body: registrarLeituraRequestDto }),
  asyncHandler(noticiasController.registrarLeitura),
);

noticiasRoutes.get(
  "/noticias/categorias",
  asyncHandler(noticiasController.listarCategorias),
);

noticiasRoutes.get(
  "/noticias",
  validarRequest({ query: listarNoticiasQueryDto }),
  asyncHandler(noticiasController.listarPublicadas),
);

noticiasRoutes.get(
  "/noticias/:slug",
  validarRequest({ params: noticiaSlugParamsDto }),
  asyncHandler(noticiasController.buscarPublicadaPorSlug),
);

noticiasRoutes.get(
  "/admin/noticias",
  autorizar("NOTICIAS"),
  validarRequest({ query: listarNoticiasAdminQueryDto }),
  asyncHandler(noticiasController.listarAdministracao),
);

noticiasRoutes.post(
  "/admin/noticias",
  autorizar("NOTICIAS"),
  validarRequest({ body: criarNoticiaRequestDto }),
  asyncHandler(noticiasController.criarNoticia),
);

noticiasRoutes.put(
  "/admin/noticias/:id",
  autorizar("NOTICIAS"),
  validarRequest({ params: noticiaIdParamsDto, body: atualizarNoticiaRequestDto }),
  asyncHandler(noticiasController.atualizarNoticia),
);

noticiasRoutes.delete(
  "/admin/noticias/:id",
  autorizar("NOTICIAS"),
  validarRequest({ params: noticiaIdParamsDto }),
  asyncHandler(noticiasController.excluirNoticia),
);

noticiasRoutes.patch(
  "/admin/noticias/:id/publicar",
  autorizar("NOTICIAS"),
  validarRequest({ params: noticiaIdParamsDto }),
  asyncHandler(noticiasController.publicarNoticia),
);
