import { Router } from "express";
import { validarRequest } from "../../common/middlewares/validar-request.middleware.js";
import { asyncHandler } from "../../common/utils/async-handler.js";
import { atualizarOportunidadeRequestDto } from "./dto/atualizar-oportunidade.request.dto.js";
import { criarOportunidadeRequestDto } from "./dto/criar-oportunidade.request.dto.js";
import {
  listarOportunidadesAdminQueryDto,
  listarOportunidadesQueryDto,
} from "./dto/listar-oportunidades.query.dto.js";
import { oportunidadeIdParamsDto } from "./dto/oportunidade-params.dto.js";
import { OportunidadesController } from "./oportunidades.controller.js";

const oportunidadesController = new OportunidadesController();

export const oportunidadesRoutes = Router();

oportunidadesRoutes.get(
  "/oportunidades/categorias",
  asyncHandler(oportunidadesController.listarCategorias),
);

oportunidadesRoutes.get(
  "/cursos/categorias",
  asyncHandler(oportunidadesController.listarCategorias),
);

oportunidadesRoutes.get(
  "/oportunidades",
  validarRequest({ query: listarOportunidadesQueryDto }),
  asyncHandler(oportunidadesController.listarPublicadas),
);

oportunidadesRoutes.get(
  "/cursos",
  validarRequest({ query: listarOportunidadesQueryDto }),
  asyncHandler(oportunidadesController.listarPublicadas),
);

oportunidadesRoutes.get(
  "/oportunidades/:id",
  validarRequest({ params: oportunidadeIdParamsDto }),
  asyncHandler(oportunidadesController.buscarPublicadaPorId),
);

oportunidadesRoutes.get(
  "/cursos/:id",
  validarRequest({ params: oportunidadeIdParamsDto }),
  asyncHandler(oportunidadesController.buscarPublicadaPorId),
);

oportunidadesRoutes.get(
  "/admin/oportunidades",
  validarRequest({ query: listarOportunidadesAdminQueryDto }),
  asyncHandler(oportunidadesController.listarAdministracao),
);

oportunidadesRoutes.get(
  "/admin/cursos",
  validarRequest({ query: listarOportunidadesAdminQueryDto }),
  asyncHandler(oportunidadesController.listarAdministracao),
);

oportunidadesRoutes.post(
  "/admin/oportunidades",
  validarRequest({ body: criarOportunidadeRequestDto }),
  asyncHandler(oportunidadesController.criarOportunidade),
);

oportunidadesRoutes.post(
  "/admin/cursos",
  validarRequest({ body: criarOportunidadeRequestDto }),
  asyncHandler(oportunidadesController.criarOportunidade),
);

oportunidadesRoutes.put(
  "/admin/oportunidades/:id",
  validarRequest({ params: oportunidadeIdParamsDto, body: atualizarOportunidadeRequestDto }),
  asyncHandler(oportunidadesController.atualizarOportunidade),
);

oportunidadesRoutes.put(
  "/admin/cursos/:id",
  validarRequest({ params: oportunidadeIdParamsDto, body: atualizarOportunidadeRequestDto }),
  asyncHandler(oportunidadesController.atualizarOportunidade),
);

oportunidadesRoutes.delete(
  "/admin/oportunidades/:id",
  validarRequest({ params: oportunidadeIdParamsDto }),
  asyncHandler(oportunidadesController.excluirOportunidade),
);

oportunidadesRoutes.delete(
  "/admin/cursos/:id",
  validarRequest({ params: oportunidadeIdParamsDto }),
  asyncHandler(oportunidadesController.excluirOportunidade),
);

oportunidadesRoutes.patch(
  "/admin/oportunidades/:id/publicar",
  validarRequest({ params: oportunidadeIdParamsDto }),
  asyncHandler(oportunidadesController.publicarOportunidade),
);

oportunidadesRoutes.patch(
  "/admin/cursos/:id/publicar",
  validarRequest({ params: oportunidadeIdParamsDto }),
  asyncHandler(oportunidadesController.publicarOportunidade),
);
