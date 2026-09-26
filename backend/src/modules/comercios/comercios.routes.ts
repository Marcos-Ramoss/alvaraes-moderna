import { Router } from "express";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { atualizarComercioRequestDto } from "./dto/atualizar-comercio.request.dto.js";
import { comercioIdParamsDto, comercioSlugParamsDto } from "./dto/comercio-params.dto.js";
import { criarComercioRequestDto } from "./dto/criar-comercio.request.dto.js";
import {
  listarComerciosAdminQueryDto,
  listarComerciosQueryDto,
} from "./dto/listar-comercios.query.dto.js";
import { ComerciosController } from "./comercios.controller.js";
import { autorizar } from "../auth/auth.middleware.js";

const comerciosController = new ComerciosController();

export const comerciosRoutes = Router();

comerciosRoutes.get(
  "/comercios/categorias",
  asyncHandler(comerciosController.listarCategorias),
);

comerciosRoutes.get(
  "/comercios",
  validarRequest({ query: listarComerciosQueryDto }),
  asyncHandler(comerciosController.listarPublicados),
);

comerciosRoutes.get(
  "/comercios/:slug",
  validarRequest({ params: comercioSlugParamsDto }),
  asyncHandler(comerciosController.buscarPublicadoPorSlug),
);

comerciosRoutes.get(
  "/admin/comercios",
  autorizar("COMERCIOS"),
  validarRequest({ query: listarComerciosAdminQueryDto }),
  asyncHandler(comerciosController.listarAdministracao),
);

comerciosRoutes.post(
  "/admin/comercios",
  autorizar("COMERCIOS"),
  validarRequest({ body: criarComercioRequestDto }),
  asyncHandler(comerciosController.criarComercio),
);

comerciosRoutes.put(
  "/admin/comercios/:id",
  autorizar("COMERCIOS"),
  validarRequest({ params: comercioIdParamsDto, body: atualizarComercioRequestDto }),
  asyncHandler(comerciosController.atualizarComercio),
);

comerciosRoutes.delete(
  "/admin/comercios/:id",
  autorizar("COMERCIOS"),
  validarRequest({ params: comercioIdParamsDto }),
  asyncHandler(comerciosController.excluirComercio),
);

comerciosRoutes.patch(
  "/admin/comercios/:id/publicar",
  autorizar("COMERCIOS"),
  validarRequest({ params: comercioIdParamsDto }),
  asyncHandler(comerciosController.publicarComercio),
);
