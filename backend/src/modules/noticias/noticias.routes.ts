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

const noticiasController = new NoticiasController();

export const noticiasRoutes = Router();

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
  validarRequest({ query: listarNoticiasAdminQueryDto }),
  asyncHandler(noticiasController.listarAdministracao),
);

noticiasRoutes.post(
  "/admin/noticias",
  validarRequest({ body: criarNoticiaRequestDto }),
  asyncHandler(noticiasController.criarNoticia),
);

noticiasRoutes.put(
  "/admin/noticias/:id",
  validarRequest({ params: noticiaIdParamsDto, body: atualizarNoticiaRequestDto }),
  asyncHandler(noticiasController.atualizarNoticia),
);

noticiasRoutes.delete(
  "/admin/noticias/:id",
  validarRequest({ params: noticiaIdParamsDto }),
  asyncHandler(noticiasController.excluirNoticia),
);

noticiasRoutes.patch(
  "/admin/noticias/:id/publicar",
  validarRequest({ params: noticiaIdParamsDto }),
  asyncHandler(noticiasController.publicarNoticia),
);
